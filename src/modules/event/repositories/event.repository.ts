import { Injectable } from '@nestjs/common';
import { Event } from '../entities/event.schema';

@Injectable()
export abstract class IEventRepository {
	abstract create(event: Partial<Event>): Promise<Event>;
}
