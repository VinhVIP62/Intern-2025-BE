import { ForbiddenException, Injectable } from '@nestjs/common';
import { IEventRepository } from '../repositories/event.repository';
import { CreateEventDto } from '../dto/create-event.dto';
import { Event, EventDocument } from '../entities/event.schema';
import { Types } from 'mongoose';
import { BadRequest, Conflict, EntityNotFound, Forbidden } from '@common/exceptions';
import { UpdateEventDto } from '../dto/update-event.dto';
import { IEventParticipantRepository } from '../repositories/event-participant.repository';
import { EventJoinRequestDto } from '../dto/response-event-join-request.dto';
import { plainToInstance } from 'class-transformer';
import { UserService } from '@modules/user/providers/user.service';
import { IFriendRepository } from '@modules/friend/repositories/friend.repository';
import { EventInvitationItemDto } from '../dto/response-event-invitation.dto';
import { ResponseEventDto } from '../dto/response-event.dto';
import { ParticipationStatus } from '@common/enum/event-participation-status';
import { EventParticipant } from '../entities/event-participant.schema';
import { AppLoggerService } from '@common/logger/logger.service';
import { ElasticIndexingService } from '@modules/elastic/elastic-indexing.service';
import { FileService } from '@modules/file/providers/file.service';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { NotificationType } from '@modules/notification/type/notification-type.enum';
import { SocketEventService } from '@modules/realtime/socket-event.service';
import { extractHashtags } from '@common/utils/hashtag.util';
import { BlockService } from '@modules/block/providers/block.service';

@Injectable()
export class EventService {
	constructor(
		private readonly eventRepository: IEventRepository,
		private readonly eventParticipantRepository: IEventParticipantRepository,
		private readonly userService: UserService,
		private readonly friendRepository: IFriendRepository,
		private readonly logger: AppLoggerService,
		private readonly elasticIndexingService: ElasticIndexingService,
		private readonly fileService: FileService,
		private readonly notificationService: NotificationService,
		private readonly socketEventService: SocketEventService,
		private readonly blockService: BlockService,
	) {}

	async createEvent(userId: string, dto: CreateEventDto): Promise<ResponseEventDto> {
		const hashtags = extractHashtags(dto.title + ' ' + dto.description);

		const data: Partial<Event> = {
			...dto,
			creator: new Types.ObjectId(userId),
			hashtags,
			time: new Date(dto.time),
			sports: dto.sports?.map(id => new Types.ObjectId(id)) ?? [],
			taggedFriends: dto.taggedFriends?.map(id => new Types.ObjectId(id)) || [],
		};

		// 1. Tạo sự kiện và populate creator + sports
		const newEvent = await this.eventRepository.create(data);

		// 2. Chuyển thành DTO để dễ dùng và tránh ép kiểu
		const responseDto = plainToInstance(ResponseEventDto, newEvent, {
			excludeExtraneousValues: true,
		});

		try {
			// 3. Chuyển sports sang dạng cần index
			const sportData: string[] = responseDto.sports?.map(s => s.name) ?? [];

			// 4. Index vào Elasticsearch
			await this.elasticIndexingService.indexEvent({
				id: responseDto._id,
				creatorId: responseDto.creator._id,
				creatorName: responseDto.creator.fullName,
				title: responseDto.title,
				description: responseDto.description,
				hashtags: responseDto.hashtags,
				sports: sportData,
			});
		} catch (err) {
			this.logger.warn(
				`Không thể thêm Event vào Elasticsearch - ${err instanceof Error ? err.message : String(err)}`,
				'EventService',
			);
		}

		return responseDto;
	}

	async updateEvent(eventId: string, userId: string, dto: UpdateEventDto): Promise<Event> {
		const event = await this.eventRepository.findById(eventId);
		if (!event) throw new EntityNotFound('exception.event.notFound');

		if (event.creator._id.toString() !== userId) {
			throw new ForbiddenException('exception.event.permissionDenied');
		}

		// Cập nhật ảnh: xóa file nếu cần
		if (dto.imageUrls) {
			const oldImageUrls = event.imageUrls || [];
			const newImageUrls = dto.imageUrls;

			const deletedImages = oldImageUrls.filter(url => !newImageUrls.includes(url));

			await Promise.all(
				deletedImages.map(async url => {
					try {
						const path = this.fileService.extractFilePathFromPublicUrl(url);
						await this.fileService.deleteFile(path);
					} catch (err) {
						this.logger.warn(
							`Không thể xoá ảnh: ${url} - ${err instanceof Error ? err.message : String(err)}`,
							EventService.name,
						);
					}
				}),
			);
		}

		// Cập nhật MongoDB
		const updatedData: Partial<Event> = {
			...dto,
			time: dto.time ? new Date(dto.time) : undefined,
			sports: dto.sports?.map(id => new Types.ObjectId(id)),
		};

		const updatedEvent = await this.eventRepository.updateById(eventId, updatedData);
		const populatedEvent = await this.eventRepository.findById(eventId);

		// Cập nhật Elasticsearch
		try {
			await this.elasticIndexingService.updateEvent(eventId, {
				title: populatedEvent?.title,
				description: populatedEvent?.description,
				creatorName:
					typeof populatedEvent?.creator === 'object' && 'name' in populatedEvent.creator ?
						(populatedEvent.creator as { name: string }).name
					:	undefined,
				hashtags: populatedEvent?.hashtags,
				sports:
					Array.isArray(populatedEvent?.sports) ?
						populatedEvent.sports.map(sport =>
							typeof sport === 'object' && 'name' in sport ? (sport as { name: string }).name : '',
						)
					:	[],
			});
		} catch (error) {
			this.logger.error(
				`Elastic update failed for event ${eventId}: ${error instanceof Error ? error.message : String(error)}`,
				EventService.name,
			);
		}

		return updatedEvent;
	}

	async getEventDetail(eventId: string, currentUserId: string): Promise<ResponseEventDto> {
		const event = await this.eventRepository.findById(eventId);
		if (!event) throw new EntityNotFound('exception.event.notFound');

		const friendIds =
			currentUserId ?
				(await this.friendRepository.findAllByUserId(currentUserId)).map(id => id.toString())
			:	[];

		// Nếu sự kiện riêng tư mà người xem không phải là creator
		if (
			!event.isPublic &&
			event.creator._id.toString() !== currentUserId &&
			friendIds.includes(currentUserId)
		) {
			throw new ForbiddenException('exception.event.permissionDenied');
		}

		let participationStatus: ParticipationStatus = ParticipationStatus.NONE;

		if (event.creator._id.toString() === currentUserId) {
			participationStatus = ParticipationStatus.CREATOR;
		} else if (currentUserId) {
			const participants = await this.eventParticipantRepository.findByUserAndEventIds(
				currentUserId,
				[eventId],
			);

			const participant = participants[0];
			if (participant) {
				switch (participant.status) {
					case 'pending':
						participationStatus = ParticipationStatus.REQUESTED;
						break;
					case 'accepted':
						participationStatus = ParticipationStatus.JOINED;
						break;
					case 'rejected':
						participationStatus = ParticipationStatus.REJECTED;
						break;
					case 'invited':
						participationStatus = ParticipationStatus.INVITED;
						break;
				}
			}
		}

		const avatarMap = await this.eventParticipantRepository.findAcceptedParticipantsGroupedByEvent([
			eventId,
		]);
		const avatarUrls = (avatarMap[eventId] ?? []).map(u => u.avatarUrl);

		return plainToInstance(
			ResponseEventDto,
			{
				...(event.toObject?.() ?? event),
				participationStatus,
				avatarUrls,
			},
			{ excludeExtraneousValues: true },
		);
	}

	async requestJoinEvent(eventId: string, userId: string): Promise<void> {
		const event = await this.eventRepository.findById(eventId);
		if (!event) throw new EntityNotFound('exception.event.notFound');

		if (event.creator._id.toString() === userId) {
			throw new BadRequest('exception.event.cannotJoinOwnEvent');
		}

		const status: 'pending' | 'accepted' = event.requiresApproval ? 'pending' : 'accepted';

		const existing = await this.eventParticipantRepository.findByEventAndUser(eventId, userId);
		if (existing) {
			if (['accepted'].includes(existing.status)) {
				throw new Conflict('exception.event.alreadyJoined');
			}
			if (['pending'].includes(existing.status)) {
				throw new Conflict('exception.event.alreadyRequested');
			}
			if (['rejected', 'cancelled'].includes(existing.status)) {
				await this.eventParticipantRepository.updateStatus(eventId, userId, status);

				if (status === 'accepted') {
					await this.eventRepository.updateParticipantsCount(eventId, 1);
				}
				return;
			}
		}

		await this.eventParticipantRepository.create({
			event: new Types.ObjectId(eventId),
			user: new Types.ObjectId(userId),
			status,
		});

		if (status === 'accepted') {
			await this.eventRepository.updateParticipantsCount(eventId, 1);
		} else {
			await this.notificationService.create({
				actor: userId,
				receiver: event.creator._id.toString(),
				type: NotificationType.EventJoinRequest,
				title: 'Sự kiện của bạn nhận được một yêu cầu tham gia',
				content: `${event.title}`,
				metaRef: eventId,
				metaModel: 'Event',
			});

			const actor = await this.userService.findById(userId);

			if (!actor) {
				throw new EntityNotFound('exception.user.notFound');
			}

			this.socketEventService.sendNotification(event.creator._id.toString(), {
				actor: {
					_id: actor._id.toString(),
					fullName: actor.fullName,
					avatarUrl: actor.avatarUrl,
				},
				type: NotificationType.EventJoinRequest,
				title: 'Sự kiện của bạn nhận được một yêu cầu tham gia',
				content: `${event.title}`,
				metaRef: eventId,
				metaModel: 'Event',
				isRead: false,
				createdAt: new Date().toISOString(),
			});
		}
	}

	async getJoinRequests(
		eventId: string,
		currentUserId: string,
		status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'invited',
		page = 1,
		limit = 10,
	): Promise<{
		items: EventJoinRequestDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const event = await this.eventRepository.findById(eventId);
		if (!event) throw new EntityNotFound('exception.event.notFound');

		if (event.creator._id.toString() !== currentUserId) {
			throw new Forbidden('exception.event.forbidden');
		}

		const [requests, total] = await this.eventParticipantRepository.findByEventWithPaging(
			eventId,
			status,
			page,
			limit,
		);

		const items = requests.map(req =>
			plainToInstance(EventJoinRequestDto, req, { excludeExtraneousValues: true }),
		);

		return { items, meta: { total, page, limit } };
	}

	async respondJoinRequest(
		eventId: string,
		targetUserId: string,
		currentUserId: string,
		status: 'accepted' | 'rejected',
	): Promise<void> {
		const event = await this.eventRepository.findById(eventId);
		if (!event) {
			throw new EntityNotFound('exception.event.notFound');
		}

		if (event.creator._id.toString() !== currentUserId) {
			throw new Forbidden('exception.event.forbidden');
		}

		const request = await this.eventParticipantRepository.findByEventAndUser(eventId, targetUserId);
		if (!request) {
			throw new EntityNotFound('exception.event.requestNotFound');
		}

		if (request.status !== 'pending') {
			throw new BadRequest('exception.event.alreadyResponded');
		}

		await this.eventParticipantRepository.updateStatus(eventId, targetUserId, status);

		if (status === 'accepted') {
			await this.eventRepository.updateParticipantsCount(eventId, 1);

			await this.notificationService.create({
				actor: currentUserId,
				receiver: targetUserId,
				type: NotificationType.EventJoinRequestAccepted,
				title: 'Chủ sự kiện đã chấp nhận yêu cầu tham gia của bạn',
				content: `Chào mừng đến với ${event.title}`,
				metaRef: eventId,
				metaModel: 'Event',
			});

			const actor = await this.userService.findById(currentUserId);

			if (!actor) {
				throw new EntityNotFound('exception.user.notFound');
			}

			this.socketEventService.sendNotification(targetUserId, {
				actor: {
					_id: actor._id.toString(),
					fullName: actor.fullName,
					avatarUrl: actor.avatarUrl,
				},
				type: NotificationType.EventJoinRequestAccepted,
				title: 'Chủ sự kiện đã chấp nhận yêu cầu tham gia của bạn',
				content: `Chào mừng đến với ${event.title}`,
				metaRef: eventId,
				metaModel: 'Event',
				isRead: false,
				createdAt: new Date().toISOString(),
			});
		}
	}

	async inviteUserToEvent(
		eventId: string,
		targetUserId: string,
		currentUserId: string,
	): Promise<void> {
		const event = await this.eventRepository.findById(eventId);
		if (!event) throw new EntityNotFound('exception.event.notFound');

		if (event.creator._id.toString() !== currentUserId) {
			throw new Forbidden('exception.event.inviteForbidden');
		}

		if (event.creator._id.toString() === targetUserId) {
			throw new BadRequest('exception.event.cannotInviteSelf');
		}

		const existing = await this.eventParticipantRepository.findByEventAndUser(
			eventId,
			targetUserId,
		);

		if (existing) {
			if (['accepted', 'pending', 'invited'].includes(existing.status)) {
				throw new Conflict('exception.event.alreadyParticipantOrInvited');
			}
			if (['rejected', 'cancelled'].includes(existing.status)) {
				await this.eventParticipantRepository.updateStatus(eventId, targetUserId, 'invited');

				await this.notificationService.create({
					actor: currentUserId,
					receiver: targetUserId,
					type: NotificationType.EventInvitation,
					title: 'Bạn được mời tham gia sự kiện',
					content: `${event.title}`,
					metaRef: eventId,
					metaModel: 'Event',
				});

				const actor = await this.userService.findById(currentUserId);

				if (!actor) {
					throw new EntityNotFound('exception.user.notFound');
				}

				this.socketEventService.sendNotification(targetUserId, {
					actor: {
						_id: actor._id.toString(),
						fullName: actor.fullName,
						avatarUrl: actor.avatarUrl,
					},
					type: NotificationType.EventInvitation,
					title: 'Bạn được mời tham gia sự kiện',
					content: `${event.title}`,
					metaRef: eventId,
					metaModel: 'Event',
					isRead: false,
					createdAt: new Date().toISOString(),
				});

				return;
			}
		}

		await this.eventParticipantRepository.create({
			event: new Types.ObjectId(eventId),
			user: new Types.ObjectId(targetUserId),
			status: 'invited',
		});

		await this.notificationService.create({
			actor: currentUserId,
			receiver: targetUserId,
			type: NotificationType.EventInvitation,
			title: 'Bạn được mời tham gia sự kiện',
			content: `${event.title}`,
			metaRef: eventId,
			metaModel: 'Event',
		});

		const actor = await this.userService.findById(currentUserId);

		if (!actor) {
			throw new EntityNotFound('exception.user.notFound');
		}

		this.socketEventService.sendNotification(targetUserId, {
			actor: {
				_id: actor._id.toString(),
				fullName: actor.fullName,
				avatarUrl: actor.avatarUrl,
			},
			type: NotificationType.EventInvitation,
			title: 'Bạn được mời tham gia sự kiện',
			content: `${event.title}`,
			metaRef: eventId,
			metaModel: 'Event',
			isRead: false,
			createdAt: new Date().toISOString(),
		});
	}

	async respondInvitation(
		eventId: string,
		userId: string,
		status: 'accepted' | 'rejected',
	): Promise<void> {
		const request = await this.eventParticipantRepository.findByEventAndUser(eventId, userId);
		if (!request || request.status !== 'invited') {
			throw new BadRequest('exception.event.invalidInvitation');
		}

		await this.eventParticipantRepository.updateStatus(eventId, userId, status);

		if (status === 'accepted') {
			await this.eventRepository.updateParticipantsCount(eventId, 1);

			const event = await this.eventRepository.findById(eventId);
			if (event) {
				await this.notificationService.create({
					actor: userId,
					receiver: event.creator._id.toString(),
					type: NotificationType.EventInvitationAccepted,
					title: 'Lời mời tham gia sự kiện đã được chấp nhận',
					content: `${event.title}`,
					metaRef: eventId,
					metaModel: 'Event',
				});

				const actor = await this.userService.findById(userId);

				if (!actor) {
					throw new EntityNotFound('exception.user.notFound');
				}

				this.socketEventService.sendNotification(event.creator._id.toString(), {
					actor: {
						_id: actor._id.toString(),
						fullName: actor.fullName,
						avatarUrl: actor.avatarUrl,
					},
					type: NotificationType.EventInvitationAccepted,
					title: 'Lời mời tham gia sự kiện đã được chấp nhận',
					content: `${event.title}`,
					metaRef: eventId,
					metaModel: 'Event',
					isRead: false,
					createdAt: new Date().toISOString(),
				});
			}
		}
	}

	async getParticipants(
		eventId: string,
		currentUserId: string,
		page = 1,
		limit = 10,
	): Promise<{
		items: EventJoinRequestDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const event = await this.eventRepository.findById(eventId);
		if (!event) throw new EntityNotFound('exception.event.notFound');

		// Nếu sự kiện không public thì chỉ người đã tham gia mới được xem
		if (!event.isPublic && event.creator._id.toString() !== currentUserId) {
			const participant = await this.eventParticipantRepository.findByEventAndUser(
				eventId,
				currentUserId,
			);
			if (!participant || participant.status !== 'accepted') {
				throw new Forbidden('exception.event.participantOnly');
			}
		}

		const [participants, total] = await this.eventParticipantRepository.findByEventWithPaging(
			eventId,
			'accepted',
			page,
			limit,
		);

		const items = participants.map(p =>
			plainToInstance(EventJoinRequestDto, p, { excludeExtraneousValues: true }),
		);

		return { items, meta: { total, page, limit } };
	}

	async getEventInvitations(
		userId: string,
		page = 1,
		limit = 10,
	): Promise<{
		items: EventInvitationItemDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const [invitations, total] = await this.eventParticipantRepository.findEventsByUserAndStatus(
			userId,
			'invited',
			page,
			limit,
		);

		const populated = invitations.filter(
			p => typeof p.event === 'object' && 'toObject' in p.event,
		) as ((typeof invitations)[0] & { event: EventDocument })[];

		const events = populated.map(p => p.event);
		const eventIds = events.map(e => e._id.toString());

		const avatarMap =
			await this.eventParticipantRepository.findAcceptedParticipantsGroupedByEvent(eventIds);

		const items = populated.map(p =>
			plainToInstance(
				EventInvitationItemDto,
				{
					...(p.toObject?.() ?? p),
					event: plainToInstance(ResponseEventDto, {
						...(p.event.toObject?.() ?? p.event),
						avatarUrls: (avatarMap[p.event._id.toString()] ?? []).map(u => u.avatarUrl),
					}),
				},
				{ excludeExtraneousValues: true },
			),
		);

		return {
			items,
			meta: { total, page, limit },
		};
	}

	async getCreatedEvents(
		userId: string,
		page = 1,
		limit = 10,
	): Promise<{
		items: ResponseEventDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const [events, total] = await this.eventRepository.findByCreator(userId, page, limit);

		const eventIds = events.map(e => e._id.toString());

		const avatarMap =
			await this.eventParticipantRepository.findAcceptedParticipantsGroupedByEvent(eventIds);

		const items = events.map(event =>
			plainToInstance(
				ResponseEventDto,
				{
					...(event.toObject?.() ?? event),
					avatarUrls: (avatarMap[event._id.toString()] ?? []).map(u => u.avatarUrl),
				},
				{ excludeExtraneousValues: true },
			),
		);

		return {
			items,
			meta: { total, page, limit },
		};
	}

	async getJoinedEvents(
		userId: string,
		page = 1,
		limit = 10,
	): Promise<{
		items: ResponseEventDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const [participants, total] = await this.eventParticipantRepository.findEventsByUserAndStatus(
			userId,
			'accepted',
			page,
			limit,
		);

		const events = participants
			.map(p => {
				if (typeof p.event === 'object' && 'toObject' in p.event) {
					return p.event as unknown as EventDocument;
				}
				return null;
			})
			.filter((e): e is EventDocument => e !== null);

		const eventIds = events.map(e => e._id.toString());

		const avatarMap =
			await this.eventParticipantRepository.findAcceptedParticipantsGroupedByEvent(eventIds);

		const items = events.map(event =>
			plainToInstance(
				ResponseEventDto,
				{
					...(event.toObject?.() ?? event),
					avatarUrls: (avatarMap[event._id.toString()] ?? []).map(u => u.avatarUrl),
				},
				{ excludeExtraneousValues: true },
			),
		);

		return {
			items,
			meta: { total, page, limit },
		};
	}

	async getNearbyEventsByUserLocation(
		userId: string,
		filter: {
			sportId?: string;
			creatorId?: string;
			requiresApproval?: boolean;
		},
		page = 1,
		limit = 10,
	): Promise<{
		items: ResponseEventDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const user = await this.userService.findById(userId);

		if (!user?.location?.coordinates) {
			throw new BadRequest('exception.user.locationNotFound');
		}

		const [lng, lat] = user.location.coordinates;

		let blockedUserIds: string[] = [];

		if (userId) {
			const blockObjects = await this.blockService.getBlockedUsers(userId, 'event');
			blockedUserIds = blockObjects.map(p => p.blocked._id);
		}

		const friendIds =
			userId ? (await this.friendRepository.findAllByUserId(userId)).map(id => id.toString()) : [];

		const [events, total] = await this.eventRepository.findEventsNearbyWithFilters(
			{ lat, lng },
			filter,
			page,
			limit,
			userId,
			friendIds,
			blockedUserIds,
		);

		const eventIds = events.map(event => event._id.toString());

		const participants = await this.eventParticipantRepository.findByUserAndEventIds(
			userId,
			eventIds,
		);

		const avatarMap =
			await this.eventParticipantRepository.findAcceptedParticipantsGroupedByEvent(eventIds);

		const participationMap = new Map<string, EventParticipant>();
		participants.forEach(p => participationMap.set(p.event.toString(), p));

		const itemsWithStatus = events.map(event => {
			const eventId = event._id.toString();
			let participationStatus: ParticipationStatus = ParticipationStatus.NONE;

			if (event.creator._id.toString() === userId) {
				participationStatus = ParticipationStatus.CREATOR;
			} else {
				const participant = participationMap.get(eventId);
				if (participant) {
					switch (participant.status) {
						case 'pending':
							participationStatus = ParticipationStatus.REQUESTED;
							break;
						case 'accepted':
							participationStatus = ParticipationStatus.JOINED;
							break;
						case 'rejected':
							participationStatus = ParticipationStatus.REJECTED;
							break;
						case 'invited':
							participationStatus = ParticipationStatus.INVITED;
							break;
					}
				}
			}

			const avatarUrls = (avatarMap[eventId] ?? []).map(u => u.avatarUrl);

			return plainToInstance(
				ResponseEventDto,
				{
					...event,
					participationStatus,
					avatarUrls,
				},
				{
					excludeExtraneousValues: true,
				},
			);
		});

		return {
			items: itemsWithStatus,
			meta: { total, page, limit },
		};
	}

	async findManyByIds(eventIds: string[], userId: string | null): Promise<ResponseEventDto[]> {
		const friendIds =
			userId ? (await this.friendRepository.findAllByUserId(userId)).map(id => id.toString()) : [];

		let blockedUserIds: string[] = [];

		if (userId) {
			const blockObjects = await this.blockService.getBlockedUsers(userId, 'event');
			blockedUserIds = blockObjects.map(p => p.blocked._id);
		}

		const events = await this.eventRepository.findManyByIds(eventIds, blockedUserIds);

		// Kiểm tra quyền xem từng event
		const visibleEvents = events.filter(event => {
			if (event.isPublic) return true;
			if (!userId) return false;

			const creatorId = event.creator._id?.toString?.() ?? event.creator.toString();
			return creatorId === userId || friendIds.includes(creatorId);
		});

		// Lấy participant info nếu cần
		const participants =
			userId ? await this.eventParticipantRepository.findByUserAndEventIds(userId, eventIds) : [];

		const participationMap = new Map<string, EventParticipant>();
		participants.forEach(p => participationMap.set(p.event.toString(), p));

		const avatarMap =
			await this.eventParticipantRepository.findAcceptedParticipantsGroupedByEvent(eventIds);

		const eventsWithStatus = visibleEvents.map(event => {
			let participationStatus: ParticipationStatus = ParticipationStatus.NONE;

			const creatorId = event.creator._id?.toString?.() ?? event.creator.toString();
			if (userId && creatorId === userId) {
				participationStatus = ParticipationStatus.CREATOR;
			} else {
				const participant = participationMap.get(event._id.toString());
				if (participant) {
					switch (participant.status) {
						case 'pending':
							participationStatus = ParticipationStatus.REQUESTED;
							break;
						case 'accepted':
							participationStatus = ParticipationStatus.JOINED;
							break;
						case 'rejected':
							participationStatus = ParticipationStatus.REJECTED;
							break;
						case 'invited':
							participationStatus = ParticipationStatus.INVITED;
							break;
					}
				}
			}

			const avatarUrls = (avatarMap[event._id.toString()] ?? []).map(u => u.avatarUrl);

			return plainToInstance(
				ResponseEventDto,
				{
					...(event.toObject?.() ?? event),
					participationStatus,
					avatarUrls,
				},
				{ excludeExtraneousValues: true },
			);
		});

		return eventsWithStatus;
	}
}
