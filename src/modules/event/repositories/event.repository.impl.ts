import { Injectable } from '@nestjs/common';
import { IEventRepository } from './event.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../entities/event.schema';

@Injectable()
export class EventRepositoryImpl implements IEventRepository {
	constructor(@InjectModel(Event.name) private readonly eventModel: Model<Event>) {}

	async findManyByIds(ids: string[]): Promise<Event[]> {
		return this.eventModel.find({ _id: { $in: ids } }).lean();
	}
}
