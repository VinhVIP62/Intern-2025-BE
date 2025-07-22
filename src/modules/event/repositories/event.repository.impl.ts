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

	async create(event: any): Promise<any> {
		return (await this.eventModel.create(event)).toObject();
	}

	async findAll(query: any, options: any): Promise<{ events: any[]; total: number }> {
		const { page = 1, limit = 10 } = options;
		const skip = (page - 1) * limit;
		const [events, total] = await Promise.all([
			this.eventModel
				.find(query)
				.skip(skip)
				.limit(limit)
				.populate({
					path: 'organizer',
					select: 'firstName lastName avatar fullName name description',
				})
				.lean(),
			this.eventModel.countDocuments(query),
		]);
		return { events, total };
	}

	async findById(id: string): Promise<any> {
		return this.eventModel
			.findById(id)
			.populate({
				path: 'organizer',
				select: 'firstName lastName avatar fullName name description',
			})
			.lean();
	}

	async updateById(id: string, update: any): Promise<any> {
		return this.eventModel.findByIdAndUpdate(id, update, { new: true }).lean();
	}

	async deleteById(id: string): Promise<any> {
		return this.eventModel.findByIdAndDelete(id).lean();
	}
}
