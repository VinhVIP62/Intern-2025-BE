import { Injectable } from '@nestjs/common';
import { IEventRepository } from './event.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from '../entities/event.schema';
@Injectable()
export class EventRepositoryImpl implements IEventRepository {
	constructor(@InjectModel(Event.name) private readonly eventModel: Model<Event>) {}
	async create(event: Partial<Event>): Promise<Event> {
		return this.eventModel.create(event);
	}
}
