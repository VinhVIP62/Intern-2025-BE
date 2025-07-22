import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IEventRepository } from '../repositories/event.repository';
import { OrganizerType, RSVPStatus } from '../entities/event.enum';
import { GroupService } from '@modules/group/providers/group.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class EventService {
	constructor(
		private readonly eventRepository: IEventRepository,
		private readonly groupService: GroupService,
	) {}

	async getBasicInfos(
		eventIds: string[],
	): Promise<{ eventId: string; title: string; image: string }[]> {
		const events = await this.eventRepository.findManyByIds(eventIds);
		return events.map(event => ({
			eventId: String(event._id as any),
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
}
