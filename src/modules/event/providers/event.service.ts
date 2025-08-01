import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import * as Dto from '../dto';
import { Event } from '../entities';
import { UploadService } from '@modules/upload/providers/upload.service';
import { EventResponseDto, userJoinedEventResponseDto } from '../dto/response/eventResponse.dto';
import { plainToInstance } from 'class-transformer';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { JoinStatus } from '../enum/joinStatus.enum';

@Injectable()
export class EventService {
	constructor(
		private readonly eventRepository: EventRepository,
		private readonly uploadService: UploadService,
		private readonly notificationService: NotificationService,
	) {}

	async createEvent(event: Dto.CreateEventDto): Promise<Event> {
		return this.eventRepository.create(event);
	}
	// return with status user join ?
	async getEventById(id: string, userId: string): Promise<EventResponseDto | null> {
		const event = await this.eventRepository.getEventById(id);
		if (!event) {
			throw new NotFoundException('Event not found');
		}
		return await this.transformResponse(event, userId);
	}

	async checkUserJoin(eventId: string, userId: string): Promise<string> {
		const userJoin = await this.eventRepository.findJoinEvent({
			eventId,
			userId,
		});
		return userJoin ? userJoin.status : JoinStatus.NOT_JOINED;
	}

	async getEventsByUserId(
		page: number = 1,
		limit: number = 10,
		userId: string,
	): Promise<Dto.EventResPaginatedDto> {
		if (page < 1) {
			throw new BadRequestException('Page must be greater than 0');
		}
		if (limit < 1 || limit > 100) {
			throw new BadRequestException('Limit must be greater than 0 and less than 100');
		}
		const { events, total } = await this.eventRepository.getEventsByUserId(page, limit, userId);
		const totalPages = Math.ceil(total / limit);
		const hasPreviousPage = page > 1;
		const hasNextPage = page < totalPages;
		const eventsResponse = await Promise.all(
			events.map(async event => await this.transformResponse(event, userId)),
		);
		return {
			events: eventsResponse,
			pagination: { total, page, limit, totalPages, hasPreviousPage, hasNextPage },
		};
	}
	async getAllEvents(
		page: number,
		limit: number,
		userId: string,
	): Promise<Dto.EventResPaginatedDto> {
		const { events, total } = await this.eventRepository.findAll(page, limit);
		const totalPages = Math.ceil(total / limit);
		const hasPreviousPage = page > 1;
		const hasNextPage = page < totalPages;
		const eventsResponse = await Promise.all(
			events.map(async event => await this.transformResponse(event, userId)),
		);
		return {
			events: eventsResponse,
			pagination: { total, page, limit, totalPages, hasPreviousPage, hasNextPage },
		};
	}

	async updateEvent(id: string, event: Dto.UpdateEventDto): Promise<Event | null> {
		//check to delete image
		const myEvent = await this.eventRepository.getEventById(id);
		if (!myEvent) {
			throw new NotFoundException('Event not found');
		}
		//check to delete image
		if (myEvent.authorId !== event.userId) {
			throw new ForbiddenException('You are not the author of this event');
		}
		//get image to delete, if url is null -> delete all images
		const imagesToDelete = myEvent.images.filter(image => !event.url?.some(e => e === image.url));

		if (imagesToDelete.length > 0) {
			//delete image
			for (const image of imagesToDelete) {
				await this.uploadService.deleteImage(image.publicId);
			}
		}
		//get image to add
		const imagesToAdd = myEvent.images.filter(image => event.url?.some(e => e === image.url));
		//upload image
		//add new url
		const eventWithNewUrl = {
			...event,
			images: [...imagesToAdd, ...(event.images || [])],
		};

		const updatedEvent = await this.eventRepository.update(id, eventWithNewUrl);
		if (!updatedEvent) {
			throw new NotFoundException('Event not found');
		}
		return updatedEvent;
	}
	//remember delete image
	async deleteEvent(id: string, userId: string): Promise<void> {
		const event = await this.eventRepository.getEventById(id);
		if (!event) {
			throw new NotFoundException('Event not found');
		}
		if (event.authorId !== userId) {
			throw new ForbiddenException('You are not the author of this event');
		}
		await this.eventRepository.delete(id);
		for (const image of event.images) {
			await this.uploadService.deleteImage(image.publicId);
		}
	}
	//
	async joinEvent(eventId: string, userId: string): Promise<void> {
		const event = await this.eventRepository.getEventById(eventId);
		if (!event) {
			throw new NotFoundException('Event not found');
		}
		if (event.authorId === userId) {
			throw new ForbiddenException('You cannot join your own event');
		}
		//check if event is full
		if (event.userJoin >= event.maxJoin) {
			throw new BadRequestException('Event is full');
		}
		await this.eventRepository.joinEvent(eventId, userId);
		await this.notificationService.createNotification({
			userId: event.authorId,
			ownerTypeId: eventId,
			type: 'event',
			read: false,
		});
	}

	async leaveEvent(eventId: string, userId: string, joined: boolean = false): Promise<void> {
		const event = await this.eventRepository.getEventById(eventId);
		if (!event) {
			throw new NotFoundException('Event not found');
		}
		if (event.authorId === userId) {
			throw new ForbiddenException('You cannot leave your own event');
		}
		const eventResponse = await this.getEventById(eventId, userId);
		//leave event
		if (joined) {
			if (eventResponse && eventResponse?.isJoined === JoinStatus.JOINED) {
				const deletedJoinEvent = await this.eventRepository.leaveEvent(eventId, userId);
				if (deletedJoinEvent.deletedCount === 0) {
					throw new BadRequestException('You are not joined this event');
				}
				await this.notificationService.deleteNotification(event.authorId, eventId);
				return;
			}
			throw new BadRequestException('You are not joined this event');
		}
		//cancel join event
		if (eventResponse && eventResponse?.isJoined === JoinStatus.JOINED) {
			throw new BadRequestException('You are already joined this event');
		}

		await this.notificationService.deleteNotification(event.authorId, eventId);
		await this.eventRepository.cancelJoinEvent(eventId, userId);
	}

	async acceptJoinEvent(eventId: string, userId: string, userReqId: string): Promise<void> {
		const event = await this.eventRepository.getEventById(eventId);
		if (!event) {
			throw new NotFoundException('Event not found');
		}
		if (event.authorId !== userId) {
			throw new ForbiddenException('You are not the author of this event');
		}
		//+1 userJoin
		console.log('eventId accept', eventId);
		await this.eventRepository.updateEventParticipants(eventId, userReqId, 'joined');
		await this.notificationService.deleteNotification(userId, eventId);
		await this.eventRepository.updateJoinEvent(eventId, userReqId, 'joined');
	}

	async rejectJoinEvent(eventId: string, userId: string, userReqId: string): Promise<void> {
		const event = await this.eventRepository.getEventById(eventId);
		if (!event) {
			throw new NotFoundException('Event not found');
		}
		if (event.authorId !== userId) {
			throw new ForbiddenException('You are not the author of this event');
		}
		await this.eventRepository.deleteJoinEvent(eventId, userReqId);
		await this.notificationService.deleteNotification(userId, eventId);
	}
	async getUserJoinedEvents(
		eventId: string,
		page: number,
		limit: number,
	): Promise<Dto.UserJoinedEventResPaginatedDto> {
		const userJoinedEvent = await this.eventRepository.findById(eventId);
		if (!userJoinedEvent) {
			throw new NotFoundException('Event not found');
		}
		if (page < 1) {
			throw new BadRequestException('Page must be greater than 0');
		}
		if (limit < 1 || limit > 100) {
			throw new BadRequestException('Limit must be greater than 0 and less than 100');
		}
		const { userJoinedEvents, total } = await this.eventRepository.getUserJoinedEvents(
			eventId,
			page,
			limit,
		);
		const totalPages = Math.ceil(total / limit);
		const hasPreviousPage = page > 1;
		const hasNextPage = page < totalPages;
		return {
			users: userJoinedEvents,
			pagination: { total, page, limit, totalPages, hasPreviousPage, hasNextPage },
		};
	}

	async getUserRequestJoinEvents(
		eventId: string,
		page: number,
		limit: number,
		userId: string,
	): Promise<Dto.UserJoinedEventResPaginatedDto> {
		const userRequestJoinEvent = await this.eventRepository.findById(eventId);
		if (!userRequestJoinEvent) {
			throw new NotFoundException('Event not found');
		}
		if (page < 1) {
			throw new BadRequestException('Page must be greater than 0');
		}
		if (limit < 1 || limit > 100) {
			throw new BadRequestException('Limit must be greater than 0 and less than 100');
		}
		const { userRequestJoinEvents, total } = await this.eventRepository.getUserRequestJoinEvents(
			eventId,
			page,
			limit,
		);
		//check if user is the author of the event
		if (userRequestJoinEvent.authorId !== userId) {
			throw new ForbiddenException('You are not the author of this event');
		}
		const totalPages = Math.ceil(total / limit);
		const hasPreviousPage = page > 1;
		const hasNextPage = page < totalPages;
		return {
			users: userRequestJoinEvents,
			pagination: { total, page, limit, totalPages, hasPreviousPage, hasNextPage },
		};
	}

	async transformResponse(event: Event, userId: string): Promise<EventResponseDto> {
		return plainToInstance(EventResponseDto, {
			...JSON.parse(JSON.stringify(event)),
			images: event.images.map(image => image.url),
			isJoined: await this.checkUserJoin(event._id.toString(), userId),
		});
	}
	//search event
	async searchEvent(query: string, userId: string): Promise<EventResponseDto[]> {
		const events = await this.eventRepository.searchEvent(query);
		return Promise.all(events.map(event => this.transformResponse(event, userId)));
	}
}
