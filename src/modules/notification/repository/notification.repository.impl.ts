import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Notification, NotificationDocument } from '../entities/notification.schema';
import { NotificationQueryDto } from '../dto/notification.query.dto';

@Injectable()
export class NotificationRepositoryImpl implements NotificationRepository {
	constructor(
		@InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
	) {}

	async createNotification(notification: Partial<Notification>): Promise<Notification> {
		const newNotification = new this.notificationModel(notification);
		return newNotification.save();
	}

	async getNotifications(userId: string, query: NotificationQueryDto): Promise<Notification[]> {
		const { type, page, limit } = query;
		const skip = (page - 1) * limit;
		const queryFilter: FilterQuery<NotificationDocument> = { userId: userId };
		if (type) {
			queryFilter.type = type;
		}
		console.log('queryFilter', queryFilter);
		return this.notificationModel
			.find(queryFilter)
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 })
			.exec();
	}

	async getNotificationById(notificationId: string): Promise<Notification | null> {
		return this.notificationModel.findById(notificationId).exec();
	}

	async updateNotification(notification: Notification): Promise<Notification | null> {
		return this.notificationModel.findByIdAndUpdate(notification._id, notification, { new: true });
	}

	async deleteNotification(notification: Notification): Promise<Notification | null> {
		return this.notificationModel.findByIdAndDelete(notification._id);
	}

	async findOne(query: any): Promise<Notification | null> {
		return this.notificationModel.findOne(query).exec();
	}
}
