import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventParticipant } from '../entities/event-participant.schema';
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
		status: 'accepted' | 'rejected',
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
}
