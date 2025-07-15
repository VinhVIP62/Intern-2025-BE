import { Injectable } from '@nestjs/common';
import { IEventRepository } from './event.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from '../entities/event.schema';
import { EventState } from '@common/enum/event.state';

@Injectable()
export class EventRepositoryImpl implements IEventRepository {
	constructor(@InjectModel(Event.name) private readonly eventModel: Model<Event>) {}

	async create(event: Partial<Event>): Promise<Event> {
		return this.eventModel.create(event);
	}

	async getEventByUserIdAndEventId(userId: string, eventId: string): Promise<Event | null> {
		return this.eventModel.findOne({ ownerId: userId, id: eventId });
	}

	async getEventById(eventId: string): Promise<Event | null> {
		return this.eventModel.findOne({ id: eventId });
	}

	async updateMemberCount(eventId: string, inc: number): Promise<Event | null> {
		return this.eventModel
			.findOneAndUpdate({ id: eventId }, { $inc: { numOfMem: inc } }, { new: true })
			.exec();
	}

	async updateInterestedCount(eventId: any, inc: number): Promise<Event | null> {
		return this.eventModel
			.findOneAndUpdate({ id: eventId }, { $inc: { interestedCount: inc } }, { new: true })
			.exec();
	}

	async getEventsNearby(center: [number, number], radiusInMeters: number): Promise<Event[]> {
		return this.eventModel.aggregate([
			{
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: center, // [lng, lat]
					},
					distanceField: 'distance',
					maxDistance: radiusInMeters,
					spherical: true,
				},
			},
			{
				$match: {
					isDeleted: false,
					state: EventState.PUBLIC,
				},
			},
			{
				$sort: {
					startTime: 1,
				},
			},
		]);
	}
}
