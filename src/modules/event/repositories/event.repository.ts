import { Injectable } from '@nestjs/common';
import { Event } from '../entities/event.schema';

@Injectable()
export abstract class IEventRepository {
	abstract create(event: Partial<Event>): Promise<Event>;
	abstract getEventByUserIdAndEventId(userId: string, eventId: string): Promise<Event | null>;
	abstract getEventById(eventId: string): Promise<Event | null>;
	abstract getEventsNearby(center: [number, number], radiusInMeters: number): Promise<Event[]>;
}
