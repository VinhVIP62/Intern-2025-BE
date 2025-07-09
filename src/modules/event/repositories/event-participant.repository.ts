import { EventParticipant } from '../entities/event-participant.schema';

export abstract class IEventParticipantRepository {
	abstract create(data: Partial<EventParticipant>): Promise<EventParticipant>;
	abstract findByEventAndUser(eventId: string, userId: string): Promise<EventParticipant | null>;
	abstract findByEventWithPaging(
		eventId: string,
		status: string | undefined,
		page: number,
		limit: number,
	): Promise<[EventParticipant[], number]>;
	abstract updateStatus(
		eventId: string,
		userId: string,
		status: 'accepted' | 'rejected',
	): Promise<void>;
}
