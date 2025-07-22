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

	async createEvent(data: any): Promise<any> {
		return this.eventRepository.create(data);
	}

	async getAllEvents(query: any, options: any): Promise<{ events: any[]; total: number }> {
		return this.eventRepository.findAll(query, options);
	}

	async getEventById(id: string): Promise<any> {
		return this.eventRepository.findById(id);
	}

	async updateEvent(id: string, update: any): Promise<any> {
		return this.eventRepository.updateById(id, update);
	}

	async deleteEvent(id: string): Promise<any> {
		return this.eventRepository.deleteById(id);
	}
}
