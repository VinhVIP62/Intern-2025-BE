import { RSVPStatus } from '../entities/event.enum';

export interface IEventRepository {
	findManyByIds(ids: string[]): Promise<any[]>;
	create(event: any): Promise<any>;
	findAll(query: any, options: any): Promise<{ events: any[]; total: number }>;
	findById(id: string): Promise<any>;
	updateById(id: string, update: any): Promise<any>;
	deleteById(id: string): Promise<any>;

	// Participation APIs
	joinEvent(eventId: string, userId: string): Promise<any>;
	leaveEvent(eventId: string, userId: string): Promise<any>;
	rsvpEvent(eventId: string, userId: string, status: RSVPStatus): Promise<any>;
	getParticipants(
		eventId: string,
		options: { page: number; limit: number },
	): Promise<{ participants: any[]; total: number }>;
}

export const IEventRepository = Symbol('IEventRepository');
