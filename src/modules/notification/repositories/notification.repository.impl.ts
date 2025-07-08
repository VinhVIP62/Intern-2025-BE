import { Injectable } from '@nestjs/common';
import { INotificationRepository } from './notification.repository';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from '../entities/notification.schema';

@Injectable()
export class NotificationRepositoryImpl implements INotificationRepository {
	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<Notification>,
	) {}

	async findNotificationsByUser(
		userId: string,
		page: number = 1,
		limit: number = 10,
		isRead?: boolean,
	) {
		const filter: any = { recipient: userId, isActive: true };
		if (typeof isRead === 'boolean' && isRead !== undefined) filter.isRead = isRead;
		const [notifications, total] = await Promise.all([
			this.notificationModel
				.find(filter)
				.sort({ createdAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.lean(),
			this.notificationModel.countDocuments(filter),
		]);
		return { notifications, total };
	}

	async countUnreadNotifications(userId: string) {
		return this.notificationModel.countDocuments({
			recipient: userId,
			isRead: false,
			isActive: true,
		});
	}

	async getUnreadNotifications(userId: string, page?: number, limit?: number) {
		const query = this.notificationModel
			.find({
				recipient: userId,
				isRead: false,
				isActive: true,
			})
			.sort({ createdAt: -1 });

		if (page && limit) {
			query.skip((page - 1) * limit);
		}

		if (limit) {
			query.limit(limit);
		}

		return query.lean();
	}

	async markAsRead(notificationId: string) {
		return this.notificationModel.updateOne(
			{ _id: new Types.ObjectId(notificationId) },
			{ $set: { isRead: true } },
		);
	}

	async markAllAsRead(userId: string) {
		return this.notificationModel.updateMany(
			{ recipient: userId, isActive: true, isRead: false },
			{ $set: { isRead: true } },
		);
	}

	async markAsUnread(notificationId: string) {
		return this.notificationModel.updateOne(
			{ _id: new Types.ObjectId(notificationId) },
			{ $set: { isRead: false } },
		);
	}

	async softDelete(notificationId: string) {
		return this.notificationModel.deleteOne({ _id: new Types.ObjectId(notificationId) });
	}

	async clearAll(userId: string) {
		return this.notificationModel.deleteMany({ recipient: userId, isActive: true });
	}
}
