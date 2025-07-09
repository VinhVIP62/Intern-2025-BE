import { Event } from '../entities/event.schema';

export abstract class IEventRepository {
	abstract create(data: Partial<Event>): Promise<Event>;
	abstract updateById(id: string, data: Partial<Event>): Promise<Event>;
	abstract findById(id: string): Promise<Event | null>;
}
