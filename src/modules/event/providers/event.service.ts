import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IEventRepository } from '../repositories/event.repository';
import { EventStatus, OrganizerType, RSVPStatus } from '../entities/event.enum';
import { GroupService } from '@modules/group/providers/group.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { EventInvitationStatus } from '../entities/event.enum';
import { UserService } from '@modules/user/providers/user.service';

@Injectable()
export class EventService {
	constructor(
		private readonly eventRepository: IEventRepository,
		private readonly groupService: GroupService,
		private readonly userService: UserService,
	) {}

	async getBasicInfos(
		eventIds: string[],
	): Promise<{ _id: string; title: string; image: string }[]> {
		const events = await this.eventRepository.findManyByIds(eventIds);
		return events.map(event => ({
			_id: String(event._id as any),
			title: event.title,
			image: event.image,
		}));
	}

	async createEvent(data: any): Promise<any> {
		return this.eventRepository.create(data);
	}

	async getAllEvents(query: any, options: any): Promise<{ events: any[]; total: number }> {
		return this.eventRepository.findAll(query, options);
	}

	async getEventById(id: string): Promise<any> {
		return this.eventRepository.findById(id);
	}

	async updateEvent(id: string, update: any): Promise<any> {
		return this.eventRepository.updateById(id, update);
	}

	async deleteEvent(id: string): Promise<any> {
		return this.eventRepository.deleteById(id);
	}

	async deleteEventWithPermission(eventId: string, userId: string, i18n: any): Promise<void> {
		const event = await this.getEventById(eventId);
		if (!event) {
			throw new HttpException(
				{
					success: false,
					message: i18n.t('event.EVENT_NOT_FOUND'),
				},
				HttpStatus.NOT_FOUND,
			);
		}
		if (event.organizerType === OrganizerType.USER) {
			let ownerId = event.organizer;
			if (ownerId && typeof ownerId === 'object' && ownerId._id) {
				ownerId = ownerId._id;
			}
			ownerId = ownerId?.toString?.();
			if (!ownerId || !isValidObjectId(ownerId)) {
				throw new HttpException(
					{
						success: false,
						message: i18n.t('event.EVENT_ORGANIZER_INVALID'),
					},
					HttpStatus.BAD_REQUEST,
				);
			}
			if (ownerId !== userId) {
				throw new HttpException(
					{
						success: false,
						message: i18n.t('event.NO_PERMISSION_DELETE'),
					},
					HttpStatus.FORBIDDEN,
				);
			}
		} else if (event.organizerType === OrganizerType.GROUP) {
			let groupId = event.organizer;
			if (groupId && typeof groupId === 'object' && groupId._id) {
				groupId = groupId._id;
			}
			groupId = groupId?.toString?.();
			if (!groupId || !isValidObjectId(groupId)) {
				throw new HttpException(
					{
						success: false,
						message: i18n.t('event.EVENT_ORGANIZER_INVALID'),
					},
					HttpStatus.BAD_REQUEST,
				);
			}
			const isAdmin = await this.groupService['groupRepository'].isUserAdmin(groupId, userId);
			if (!isAdmin) {
				throw new HttpException(
					{
						success: false,
						message: i18n.t('event.NO_PERMISSION_DELETE'),
					},
					HttpStatus.FORBIDDEN,
				);
			}
		}
		await this.deleteEvent(eventId);
	}

	// Join event
	async joinEvent(eventId: string, userId: string): Promise<any> {
		return this.eventRepository.joinEvent(eventId, userId);
	}

	// Leave event
	async leaveEvent(eventId: string, userId: string): Promise<any> {
		return this.eventRepository.leaveEvent(eventId, userId);
	}

	// RSVP event
	async rsvpEvent(eventId: string, userId: string, status: RSVPStatus, i18n: any): Promise<any> {
		const event = await this.getEventById(eventId);
		if (!event) {
			throw new HttpException(
				{
					success: false,
					message: i18n.t('event.EVENT_NOT_FOUND'),
				},
				HttpStatus.NOT_FOUND,
			);
		}
		const participants = (event.participants || []).map((id: any) => id.toString());
		if (!participants.includes(userId)) {
			throw new HttpException(
				{
					success: false,
					message: i18n.t('event.MUST_JOIN_BEFORE_RSVP'),
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		return this.eventRepository.rsvpEvent(eventId, userId, status);
	}

	// Get paginated participants
	async getParticipants(
		eventId: string,
		options: { page: number; limit: number },
	): Promise<{ participants: any[]; total: number }> {
		return this.eventRepository.getParticipants(eventId, options);
	}

	// ===== INVITATION, NEARBY, USER EVENTS =====

	async inviteUsersToEvent(
		eventId: string,
		senderId: string,
		userIds: string[],
		i18n?: any,
	): Promise<void> {
		// Kiểm tra event tồn tại
		const event = await this.getEventById(eventId);
		if (!event) {
			throw new HttpException(
				{ success: false, message: i18n?.t('event.EVENT_NOT_FOUND') },
				HttpStatus.NOT_FOUND,
			);
		}
		await this.eventRepository.inviteUsersToEvent(eventId, senderId, userIds);
	}

	async getUserEventInvitations(
		userId: string,
		page: number,
		limit: number,
		i18n?: any,
	): Promise<{ invitations: any[]; total: number }> {
		return this.eventRepository.getUserEventInvitations(userId, page, limit);
	}

	async respondToInvitation(
		invitationId: string,
		userId: string,
		status: EventInvitationStatus,
		i18n?: any,
	): Promise<any> {
		const invitation = await this.eventRepository.respondToInvitation(invitationId, userId, status);
		if (!invitation) {
			throw new HttpException(
				{ success: false, message: i18n?.t('event.INVITATION_NOT_FOUND') },
				HttpStatus.NOT_FOUND,
			);
		}
		// Nếu accept thì thêm user vào participants của event
		if (status === EventInvitationStatus.ACCEPTED) {
			await this.eventRepository.joinEvent(invitation.eventId.toString(), userId);
		}
		return invitation;
	}

	async findEventsByUserId(
		userId: string,
		page: number,
		limit: number,
		key?: string,
	): Promise<{ events: any[]; total: number }> {
		return this.eventRepository.findEventsByUserId(userId, page, limit, key);
	}

	// Cancel invitation
	async cancelInvitation(invitationId: string, userId: string, i18n: any): Promise<void> {
		const deleted = await this.eventRepository.cancelInvitation(invitationId, userId);
		if (!deleted) {
			throw new HttpException(
				{
					success: false,
					message: i18n.t('event.INVITATION_NOT_FOUND_OR_NO_PERMISSION'),
				},
				HttpStatus.NOT_FOUND,
			);
		}
	}

	async getSentInvitations(
		eventId: string,
		senderId: string,
		page: number,
		limit: number,
		i18n?: any,
	): Promise<{ invitations: any[]; total: number }> {
		return this.eventRepository.getSentInvitations(eventId, senderId, page, limit);
	}

	// Gợi ý sự kiện cho user hiện tại
	async getRecommendationsForUser(
		userId: string,
		page: number,
		limit: number,
		i18n: any,
	): Promise<any> {
		const user = await this.userService.getUserById(userId);
		if (!user)
			return {
				success: false,
				data: [],
				message: i18n.t('user.USER_NOT_FOUND'),
			};

		const favoriteSports = user.favoritesSports || [];
		const { city, district } = user.location || {};
		const friendIds = user.friends?.map(f => f.toString()) || [];

		const query: any = {
			status: EventStatus.UPCOMING,
			$or: [
				favoriteSports.length ? { sport: { $in: favoriteSports } } : null,
				city && district ? { 'location.city': city, 'location.district': district } : null,
				friendIds.length ? { participants: { $in: friendIds } } : null,
			].filter(Boolean),
			participants: { $ne: userId },
		};

		const skip = (page - 1) * limit;
		const [events, total] = await Promise.all([
			this.eventRepository.findRecommendedEvents(query, limit, skip),
			this.eventRepository.countRecommendedEvents(query),
		]);

		return {
			success: true,
			data: events,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNextPage: page * limit < total,
			hasPrevPage: page > 1,
			message: i18n.t('event.RECOMMENDATIONS_RETRIEVED_SUCCESS'),
		};
	}
}
