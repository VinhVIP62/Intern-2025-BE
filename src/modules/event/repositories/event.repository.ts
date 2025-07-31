import { Event, EventDocument } from '../entities/event.schema';

export abstract class IEventRepository {
	abstract create(data: Partial<Event>): Promise<EventDocument>;

	abstract updateById(id: string, data: Partial<Event>): Promise<Event>;

	abstract findById(id: string): Promise<EventDocument | null>;

	abstract findByCreator(
		userId: string,
		page: number,
		limit: number,
	): Promise<[EventDocument[], number]>;

	abstract findEventsNearbyWithFilters(
		userLocation: { lat: number; lng: number },
		filters: {
			sportId?: string;
			creatorId?: string;
			requiresApproval?: boolean;
		},
		page: number,
		limit: number,
		viewerId?: string,
		friendIds?: string[],
	): Promise<[EventDocument[], number]>;

	abstract findManyByIds(
		eventIds: string[],
		viewerId?: string | null,
		friendIds?: string[],
	): Promise<EventDocument[]>;

	abstract updateParticipantsCount(eventId: string, delta: number);
}
