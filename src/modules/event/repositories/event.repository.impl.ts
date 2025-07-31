import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from '../entities/event.schema';
import { Model, Types } from 'mongoose';
import { IEventRepository } from './event.repository';
import { EntityNotFound } from '@common/exceptions';

@Injectable()
export class EventRepositoryImpl implements IEventRepository {
	constructor(@InjectModel(Event.name) private readonly model: Model<Event>) {}

	async create(data: Partial<Event>): Promise<EventDocument> {
		const event = new this.model(data);
		const saved = await event.save();

		return await saved.populate([
			{ path: 'creator', select: '_id fullName' },
			{ path: 'sports', select: '_id name' },
		]);
	}

	async updateById(id: string, data: Partial<Event>): Promise<Event> {
		const updated = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
		if (!updated) throw new EntityNotFound('exception.event.notFound');
		return updated;
	}

	async findById(id: string): Promise<EventDocument | null> {
		return this.model
			.findById(id)
			.populate('creator', '_id fullName avatarUrl')
			.populate('taggedFriends', '_id fullName avatarUrl')
			.populate('sports', '_id name iconUrl')
			.exec();
	}

	async findByCreator(
		userId: string,
		page: number,
		limit: number,
	): Promise<[EventDocument[], number]> {
		const query = { creator: new Types.ObjectId(userId) };

		const [events, total] = await Promise.all([
			this.model
				.find(query)
				.sort({ createdAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.populate('creator', '_id fullName avatarUrl')
				.populate('taggedFriends', '_id fullName avatarUrl')
				.populate('sports', '_id name iconUrl'),
			this.model.countDocuments(query),
		]);

		return [events, total];
	}

	async findEventsNearbyWithFilters(
		userLocation: { lat: number; lng: number },
		filters: {
			sportId?: string;
			creatorId?: string;
			requiresApproval?: boolean;
		},
		page = 1,
		limit = 10,
		viewerId?: string,
		friendIds: string[] = [],
		blockedUserIds: string[] = [],
	): Promise<[EventDocument[], number]> {
		const now = new Date();

		const matchConditions: Record<string, any> = {
			time: { $gte: now },
		};

		if (filters.sportId) {
			matchConditions.sports = { $in: [new Types.ObjectId(filters.sportId)] };
		}

		if (filters.creatorId) {
			matchConditions.creator = new Types.ObjectId(filters.creatorId);
		}

		if (typeof filters.requiresApproval === 'boolean') {
			matchConditions.requiresApproval = filters.requiresApproval;
		}

		if (blockedUserIds.length > 0) {
			matchConditions.creator = {
				...((matchConditions.creator as object) ?? {}),
				$nin: blockedUserIds.map(id => new Types.ObjectId(id)),
			};
		}

		if (viewerId) {
			matchConditions.$or = [
				{ isPublic: true },
				{
					isPublic: false,
					creator: {
						$in: [...friendIds, viewerId]
							.map(id => new Types.ObjectId(id))
							.filter(id => !blockedUserIds.includes(id.toString())),
					},
				},
			];
		} else {
			matchConditions.isPublic = true;
		}

		const aggregate = this.model.aggregate([
			{
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: [userLocation.lng, userLocation.lat],
					},
					distanceField: 'distance',
					spherical: true,
					query: matchConditions,
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'creator',
					foreignField: '_id',
					as: 'creator',
				},
			},
			{ $unwind: '$creator' },
			{
				$lookup: {
					from: 'sports',
					localField: 'sports',
					foreignField: '_id',
					as: 'sports',
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'taggedFriends',
					foreignField: '_id',
					as: 'taggedFriends',
				},
			},
			{
				$addFields: {
					_id: { $toString: '$_id' },
					'creator._id': { $toString: '$creator._id' },
					sports: {
						$map: {
							input: '$sports',
							as: 'sport',
							in: {
								_id: { $toString: '$$sport._id' },
								name: '$$sport.name',
								iconUrl: '$$sport.iconUrl',
							},
						},
					},
					taggedFriends: {
						$map: {
							input: '$taggedFriends',
							as: 'taggedFriends',
							in: {
								_id: { $toString: '$$taggedFriends._id' },
								fullName: '$$taggedFriends.fullName',
								avatarUrl: '$$taggedFriends.avatarUrl',
							},
						},
					},
				},
			},
			{ $sort: { distance: 1, time: 1 } },
			{ $skip: (page - 1) * limit },
			{ $limit: limit },
		]);

		const [results, countResult] = await Promise.all([
			aggregate.exec(),
			this.model.countDocuments(matchConditions),
		]);

		return [results, countResult];
	}

	async findManyByIds(eventIds: string[], blockedUserIds: string[] = []): Promise<EventDocument[]> {
		const objectIds = eventIds.map(id => new Types.ObjectId(id));
		const events = await this.model
			.find({
				_id: { $in: objectIds },
				creator: { $nin: blockedUserIds.map(id => new Types.ObjectId(id)) },
			})
			.populate('creator', '_id fullName avatarUrl')
			.populate('taggedFriends', '_id fullName avatarUrl')
			.populate('sports', '_id name iconUrl');

		const eventMap = new Map(events.map(e => [e._id.toString(), e]));
		const sortedEvents = eventIds
			.map(id => eventMap.get(id.toString()))
			.filter(Boolean) as EventDocument[];

		return sortedEvents;
	}

	async updateParticipantsCount(eventId: string, delta: number) {
		await this.model.findByIdAndUpdate(eventId, {
			$inc: { participantsCount: delta },
		});
	}
}
