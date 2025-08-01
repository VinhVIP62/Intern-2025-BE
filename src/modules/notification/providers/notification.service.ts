import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from '../repository/notification.repository';
import { Notification } from '../entities/notification.schema';
import { NotificationQueryDto } from '../dto/notification.query.dto';

@Injectable()
export class NotificationService {
	constructor(private readonly notificationRepository: NotificationRepository) {}

	async createNotification(notification: Partial<Notification>): Promise<Notification> {
		return this.notificationRepository.createNotification(notification);
	}

	async getNotifications(userId: string, query: NotificationQueryDto): Promise<Notification[]> {
		return this.notificationRepository.getNotifications(userId, query);
	}

	async readNotification(userId: string, notificationId: string): Promise<Notification | null> {
		const notification = await this.notificationRepository.findOne({ _id: notificationId, userId });
		if (!notification) {
			throw new NotFoundException('Notification not found');
		}
		notification.read = true;
		return this.notificationRepository.updateNotification(notification);
	}

	async deleteNotification(userId: string, ownerTypeId: string): Promise<Notification | null> {
		const notification = await this.notificationRepository.findOne({
			ownerTypeId: ownerTypeId,
			userId: userId,
		});
		if (!notification) {
			throw new NotFoundException('Notification not found');
		}
		return this.notificationRepository.deleteNotification(notification);
	}
}
