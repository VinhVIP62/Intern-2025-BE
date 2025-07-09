import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from '../entities/event.schema';
import { Model } from 'mongoose';
import { IEventRepository } from './event.repository';
import { EntityNotFound } from '@common/exceptions';

@Injectable()
export class EventRepositoryImpl implements IEventRepository {
	constructor(@InjectModel(Event.name) private readonly eventModel: Model<Event>) {}

	async create(data: Partial<Event>): Promise<Event> {
		const event = new this.eventModel(data);
		return await event.save();
	}

	async updateById(id: string, data: Partial<Event>): Promise<Event> {
		const updated = await this.eventModel.findByIdAndUpdate(id, data, { new: true }).exec();
		if (!updated) throw new EntityNotFound('exception.event.notFound');
		return updated;
	}

	async findById(id: string): Promise<Event | null> {
		return this.eventModel
			.findById(id)
			.populate('creator', '_id fullName avatarUrl')
			.populate('sport', '_id name')
			.exec();
	}
}
