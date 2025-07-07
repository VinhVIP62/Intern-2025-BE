import { Injectable } from '@nestjs/common';
import { IEventRepository } from '../repositories/event.repository';
import { CreateEventDto } from '../dto/createEvent.dto';

@Injectable()
export class EventService {
	constructor(private readonly eventRepo: IEventRepository) {}

	async create(userId: string, body: CreateEventDto) {
		await this.eventRepo.create({
			...body,
			ownerId: userId,
		});
	}
}
