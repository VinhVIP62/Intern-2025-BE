import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventParticipant, EventParticipantDocument } from '../entities/event-participant.schema';
import { IEventParticipantRepository } from './event-participant.repository';

@Injectable()
export class EventParticipantRepositoryImpl implements IEventParticipantRepository {
	constructor(
		@InjectModel(EventParticipant.name)
		private readonly model: Model<EventParticipant>,
	) {}

	async create(data: Partial<EventParticipant>): Promise<EventParticipant> {
		const participant = new this.model(data);
		return participant.save();
	}

	async findByEventAndUser(eventId: string, userId: string): Promise<EventParticipant | null> {
		return this.model.findOne({
			event: new Types.ObjectId(eventId),
			user: new Types.ObjectId(userId),
		});
	}

	async findByEventWithPaging(
		eventId: string,
		status: string | undefined,
		page: number,
		limit: number,
	): Promise<[EventParticipant[], number]> {
		const query: Record<string, unknown> = {
			event: new Types.ObjectId(eventId),
		};
		if (status) {
			query.status = status;
		}

		const [results, total] = await Promise.all([
			this.model
				.find(query)
				.populate('user', '_id fullName avatarUrl')
				.skip((page - 1) * limit)
				.limit(limit)
				.sort({ createdAt: -1 })
				.exec(),
			this.model.countDocuments(query),
		]);

		return [results, total];
	}

	async updateStatus(
		eventId: string,
		userId: string,
		status: 'accepted' | 'rejected' | 'pending' | 'cancelled' | 'invited',
	): Promise<void> {
		await this.model.updateOne(
			{
				event: new Types.ObjectId(eventId),
				user: new Types.ObjectId(userId),
			},
			{
				$set: {
					status,
					respondedAt: new Date(),
				},
			},
		);
	}

	async findEventsByUserAndStatus(
		userId: string,
		status: string,
		page: number,
		limit: number,
	): Promise<[EventParticipantDocument[], number]> {
		const query = {
			user: new Types.ObjectId(userId),
			status,
		};

		const [results, total] = await Promise.all([
			this.model
				.find(query)
				.populate({
					path: 'event',
					populate: [{ path: 'creator' }, { path: 'sports' }],
				})
				.skip((page - 1) * limit)
				.limit(limit)
				.sort({ createdAt: -1 }),
			this.model.countDocuments(query),
		]);

		return [results, total];
	}

	async findByUserAndEventIds(userId: string, eventIds: string[]): Promise<EventParticipant[]> {
		return await this.model
			.find({
				user: new Types.ObjectId(userId),
				event: { $in: eventIds.map(id => new Types.ObjectId(id)) },
			})
			.exec();
	}

	async findAcceptedParticipantsGroupedByEvent(
		eventIds: string[],
	): Promise<Record<string, { avatarUrl: string }[]>> {
		const participants = await this.model
			.find({
				event: { $in: eventIds.map(id => new Types.ObjectId(id)) },
				status: 'accepted',
			})
			.populate({
				path: 'user',
				select: 'avatarUrl',
				model: 'User',
			})
			.sort({ createdAt: 1 }); // Ưu tiên người tham gia sớm hơn

		// Gom 3 người theo từng event
		const result: Record<string, { avatarUrl: string }[]> = {};

		for (const p of participants) {
			const doc = p as EventParticipantDocument & {
				user: { _id: Types.ObjectId; avatarUrl?: string };
			};

			const eventId = doc.event.toString();
			const avatar = doc.user?.avatarUrl;

			if (!avatar) continue;

			if (!result[eventId]) {
				result[eventId] = [];
			}

			if (result[eventId].length < 3) {
				result[eventId].push({ avatarUrl: avatar });
			}
		}

		return result;
	}
}
