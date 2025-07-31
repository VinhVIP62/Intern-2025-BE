import { EventParticipant, EventParticipantDocument } from '../entities/event-participant.schema';

export abstract class IEventParticipantRepository {
	abstract create(data: Partial<EventParticipant>): Promise<EventParticipant>;
	abstract findByEventAndUser(
		eventId: string,
		userId: string | null,
	): Promise<EventParticipant | null>;

	abstract findByEventWithPaging(
		eventId: string,
		status: string | undefined,
		page: number,
		limit: number,
	): Promise<[EventParticipant[], number]>;

	abstract updateStatus(
		eventId: string,
		userId: string,
		status: 'accepted' | 'rejected' | 'pending' | 'cancelled' | 'invited',
	): Promise<void>;

	abstract findEventsByUserAndStatus(
		userId: string,
		status: string,
		page: number,
		limit: number,
	): Promise<[EventParticipantDocument[], number]>;

	abstract findByUserAndEventIds(
		userId: string | null,
		eventIds: string[],
	): Promise<EventParticipant[]>;

	abstract findAcceptedParticipantsGroupedByEvent(
		eventIds: string[],
	): Promise<Record<string, { avatarUrl: string }[]>>;
}
