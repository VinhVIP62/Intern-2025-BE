import { ForbiddenException, Injectable } from '@nestjs/common';
import { IEventRepository } from '../repositories/event.repository';
import { CreateEventDto } from '../dto/create-event.dto';
import { Event } from '../entities/event.schema';
import { Types } from 'mongoose';
import { BadRequest, Conflict, EntityNotFound, Forbidden } from '@common/exceptions';
import { UpdateEventDto } from '../dto/update-event.dto';
import { IEventParticipantRepository } from '../repositories/event-participant.repository';
import { EventJoinRequestDto } from '../dto/response-event-join-request.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class EventService {
	constructor(
		private readonly eventRepository: IEventRepository,
		private readonly eventParticipantRepository: IEventParticipantRepository,
	) {}

	async createEvent(userId: string, dto: CreateEventDto): Promise<Event> {
		const data: Partial<Event> = {
			...dto,
			creator: new Types.ObjectId(userId),
			time: new Date(dto.time),
			sport: dto.sport ? new Types.ObjectId(dto.sport) : undefined,
		};

		return this.eventRepository.create(data);
	}

	async updateEvent(eventId: string, userId: string, dto: UpdateEventDto): Promise<Event> {
		const event = await this.eventRepository.findById(eventId);
		if (!event) throw new EntityNotFound('exception.event.notFound');

		if (event.creator.toString() !== userId) {
			throw new ForbiddenException('exception.event.permissionDenied');
		}

		const updatedData: Partial<Event> = {
			...dto,
			time: dto.time ? new Date(dto.time) : undefined,
			sport: dto.sport ? new Types.ObjectId(dto.sport) : undefined,
		};

		return this.eventRepository.updateById(eventId, updatedData);
	}

	async getEventDetail(eventId: string, currentUserId: string): Promise<Event> {
		const event = await this.eventRepository.findById(eventId);
		if (!event) throw new EntityNotFound('exception.event.notFound');

		// Nếu sự kiện riêng tư mà người xem không phải là creator
		if (!event.isPublic && event.creator.toString() !== currentUserId) {
			throw new ForbiddenException('exception.event.permissionDenied');
		}

		return event;
	}

	async requestJoinEvent(eventId: string, userId: string): Promise<void> {
		const event = await this.eventRepository.findById(eventId);
		if (!event) throw new EntityNotFound('exception.event.notFound');

		if (event.creator._id.toString() === userId) {
			throw new BadRequest('exception.event.cannotJoinOwnEvent');
		}

		const existing = await this.eventParticipantRepository.findByEventAndUser(eventId, userId);
		if (existing) {
			if (['accepted'].includes(existing.status)) {
				throw new Conflict('exception.event.alreadyJoined');
			}
			if (['pending'].includes(existing.status)) {
				throw new Conflict('exception.event.alreadyRequested');
			}
		}

		const status: 'pending' | 'accepted' = event.requiresApproval ? 'pending' : 'accepted';

		await this.eventParticipantRepository.create({
			event: new Types.ObjectId(eventId),
			user: new Types.ObjectId(userId),
			status,
		});
	}

	async getJoinRequests(
		eventId: string,
		currentUserId: string,
		status?: 'pending' | 'accepted' | 'rejected' | 'cancelled',
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
	}
}
