import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../entities/notification.schema';

@Injectable()
export class NotificationRepositoryImpl {
	constructor(
		@InjectModel(Notification.name)
		private readonly model: Model<NotificationDocument>,
	) {}

	async create(data: Partial<Notification>): Promise<NotificationDocument> {
		return this.model.create(data);
	}

	async findByUser(
		userId: string,
		page: number,
		limit: number,
	): Promise<{ items: NotificationDocument[]; total: number }> {
		const filter = { receiver: new Types.ObjectId(userId) };
		const [items, total] = await Promise.all([
			this.model
				.find(filter)
				.sort({ createdAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.populate('actor', '_id fullName avatarUrl')
				.exec(),
			this.model.countDocuments(filter),
		]);
		return { items, total };
	}

	async markAsRead(notificationId: string): Promise<void> {
		await this.model.updateOne({ _id: notificationId }, { $set: { isRead: true } });
	}

	async delete(notificationId: string): Promise<void> {
		await this.model.deleteOne({ _id: notificationId });
	}
}
