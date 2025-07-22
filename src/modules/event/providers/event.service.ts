import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IEventRepository } from '../repositories/event.repository';

@Injectable()
export class EventService {
	constructor(private readonly eventRepository: IEventRepository) {}

	async getBasicInfos(
		eventIds: string[],
	): Promise<{ eventId: string; title: string; image: string }[]> {
		const events = await this.eventRepository.findManyByIds(eventIds);
		return events.map(event => ({
			eventId: String(event._id as any),
			title: event.title,
			image: event.image,
		}));
	}
}
