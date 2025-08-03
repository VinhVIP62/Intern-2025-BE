import { Injectable } from '@nestjs/common';
import { INotificationRepository } from './notification.repository';
import { Notification } from '../entities/notification.schema';
import { Model, FilterQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class NotificationRepositoryImpl implements INotificationRepository {
	constructor(@InjectModel(Notification.name) private readonly notiModel: Model<Notification>) {}

	async create(noti: Partial<Notification>): Promise<Notification> {
		return await this.notiModel.create(noti);
	}

	async getAllInfScroll(userId: string, limit = 10, before?: Date): Promise<Notification[]> {
		const condition: FilterQuery<Notification> = { toUserId: userId };
		if (before) {
			condition.createdAt = { $lt: before };
		}

		const data = await this.notiModel.find(condition).sort({ createdAt: -1 }).limit(limit).exec();
		return data;
	}
	async totalUnread(userId: string): Promise<number> {
		const totalUnread = await this.notiModel.countDocuments({ toUserId: userId, isRead: false });
		return totalUnread;
	}
	async getUnreadNotifications(userId: string): Promise<Notification[]> {
		return this.notiModel.find({ toUserId: userId, isRead: false }).exec();
	}
	async getById(id: string): Promise<Notification | null> {
		return this.notiModel.findOne({ id: id }).exec();
	}
	async updateRead(id: string): Promise<Notification | null> {
		return this.notiModel.findOneAndUpdate({ id: id }, { isRead: true }, { new: true }).exec();
	}
}
