import { Injectable } from '@nestjs/common';
import { Event } from '../entities/event.schema';

@Injectable()
export abstract class IEventRepository {
	abstract findAll(): Promise<Event[]>;
	abstract create(event: Partial<Event>): Promise<Event>;
	abstract getEventByUserIdAndEventId(userId: string, eventId: string): Promise<Event | null>;
	abstract getEventById(eventId: string): Promise<Event | null>;
	abstract getEventsNearby(center: [number, number], radiusInMeters: number): Promise<Event[]>;
	abstract updateMemberCount(eventId: string, inc: number): Promise<Event | null>;
	abstract updateInterestedCount(eventId, inc: number): Promise<Event | null>;
	abstract _24hEvents(userId: string): Promise<Event[]>;
	abstract overdueEvents(userId: string): Promise<Event[]>;
	abstract delete(eventId: string): Promise<Event | null>;
	abstract allEventsWithin24h(): Promise<Event[]>;
}
