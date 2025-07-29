import { Injectable } from '@nestjs/common';
import { IEventRepository } from './event.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from '../entities/event.schema';
import { EventState } from '@common/enum/event/event.state';

@Injectable()
export class EventRepositoryImpl implements IEventRepository {
	constructor(@InjectModel(Event.name) private readonly eventModel: Model<Event>) {}

	async findAll(): Promise<Event[]> {
		return this.eventModel.find({ isDeleted: false }).exec();
	}

	async create(event: Partial<Event>): Promise<Event> {
		return this.eventModel.create(event);
	}

	async getEventByUserIdAndEventId(userId: string, eventId: string): Promise<Event | null> {
		return this.eventModel.findOne({ ownerId: userId, id: eventId, isDeleted: false });
	}

	async getEventById(eventId: string): Promise<Event | null> {
		return this.eventModel.findOne({ id: eventId, isDeleted: false });
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

	async overdueEvents(userId: string): Promise<Event[]> {
		const now = new Date();
		return this.eventModel.aggregate([
			{
				$lookup: {
					from: 'eventmembers',
					localField: 'id',
					foreignField: 'eventId',
					as: 'members',
				},
			},
			{
				$unwind: '$members',
			},
			{
				$match: {
					'members.memberId': userId,
					'members.state': { $in: ['accepted', 'owner'] },
					isDeleted: false,
					endTime: { $lt: now },
				},
			},
			{
				$sort: { startTime: 1 },
			},
		]);
	}

	async _24hEvents(userId: string): Promise<Event[]> {
		const now = new Date();
		const now_VN = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Adjust for timezone VN + 7 hours
		const next24h = new Date(now_VN.getTime() + 24 * 60 * 60 * 1000);
		return this.eventModel.aggregate([
			{
				$lookup: {
					from: 'eventmembers',
					localField: 'id',
					foreignField: 'eventId',
					as: 'members',
				},
			},
			{
				$unwind: '$members',
			},
			{
				$match: {
					'members.memberId': userId,
					'members.state': { $in: ['accepted', 'owner'] },
					isDeleted: false,
					startTime: { $gte: now_VN, $lte: next24h },
				},
			},
		]);
	}

	async delete(eventId: string): Promise<Event | null> {
		return this.eventModel.findOneAndUpdate(
			{ id: eventId },
			{ $set: { isDeleted: true } },
			{ new: true },
		);
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

	async allEventsWithin24h(): Promise<Event[]> {
		const now = new Date();
		const now_VN = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Adjust for timezone VN + 7 hours
		const next24h = new Date(now_VN.getTime() + 24 * 60 * 60 * 1000);
		console.log(now_VN);
		return this.eventModel
			.find({
				startTime: { $gte: now_VN, $lte: next24h },
				isDeleted: false,
			})
			.exec();
	}
}
