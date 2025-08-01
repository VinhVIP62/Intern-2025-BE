import { Injectable } from '@nestjs/common';
import { Event } from '../entities/event.schema';
import * as Dto from '../dto';
import { JoinEvent } from '../entities/joinEvent.schema';
import { userJoinedEventResponseDto } from '../dto/response/eventResponse.dto';
@Injectable()
export abstract class EventRepository {
	abstract create(event: Dto.CreateEventDto): Promise<Event>;

	abstract findById(id: string): Promise<Event | null>;

	abstract findOne(query: any): Promise<Event | null>;

	abstract findAll(page: number, limit: number): Promise<{ events: Event[]; total: number }>;

	abstract updateEventParticipants(eventId: string, userId: string, status: string): Promise<void>;
	abstract update(id: string, event: Dto.UpdateEventDto): Promise<Event | null>;

	abstract delete(id: string): Promise<void>;

	abstract joinEvent(eventId: string, userId: string): Promise<JoinEvent>;

	abstract leaveEvent(eventId: string, userId: string): Promise<any>;

	abstract cancelJoinEvent(eventId: string, userId: string): Promise<any>;

	abstract getEventsByUserId(
		page: number,
		limit: number,
		userId: string,
	): Promise<{ events: Event[]; total: number }>;

	abstract updateJoinEvent(eventId: string, userId: string, status: string): Promise<void>;

	abstract deleteJoinEvent(eventId: string, userId: string): Promise<void>;

	abstract getEventById(id: string): Promise<Event | null>;

	abstract findJoinEvent(query: any): Promise<JoinEvent | null>;

	abstract getUserJoinedEvents(
		eventId: string,
		page: number,
		limit: number,
	): Promise<{ userJoinedEvents: userJoinedEventResponseDto[]; total: number }>;

	abstract getUserRequestJoinEvents(
		eventId: string,
		page: number,
		limit: number,
	): Promise<{ userRequestJoinEvents: userJoinedEventResponseDto[]; total: number }>;

	abstract searchEvent(query: string): Promise<Event[]>;
}
