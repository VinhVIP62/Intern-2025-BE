import { Injectable } from '@nestjs/common';
import { INotificationRepository } from '../repositories/notification.repository';
import { I18nContext } from 'nestjs-i18n';
import { CreateNotificationDto } from '../dto/notification.dto';
import admin from '../../../firebase';
import { IUserRepository } from '../../user/repositories/user.repository';

@Injectable()
export class NotificationService {
	constructor(
		private readonly notificationRepository: INotificationRepository,
		private readonly userRepository: IUserRepository,
	) {}

	async createNotification(data: CreateNotificationDto, i18n?: I18nContext) {
		const notification = await this.notificationRepository.createNotification(data);
		// Lấy FCM token của user nhận qua repository
		const recipient = await this.userRepository.findOneById(data.recipient);
		if (recipient?.fcmToken) {
			await admin.messaging().send({
				token: recipient.fcmToken,
				notification: {
					title: i18n ? i18n.t('notification.NEW_NOTIFICATION') : 'New Notification',
					body: data.message,
				},
				data: {
					notificationId: notification._id.toString(),
				},
			});
		}
		return notification;
	}

	async getNotifications(userId: string, page: number, limit: number, isRead: boolean | undefined) {
		return this.notificationRepository.findNotificationsByUser(userId, page, limit, isRead);
	}

	async markAsRead(notificationId: string, i18n: I18nContext) {
		const result = await this.notificationRepository.markAsRead(notificationId);
		if (result.modifiedCount === 0) throw new Error(i18n.t('notification.NOT_FOUND'));
		return true;
	}

	async markAllAsRead(userId: string) {
		await this.notificationRepository.markAllAsRead(userId);
		return true;
	}

	async markAsUnread(notificationId: string, i18n: I18nContext) {
		const result = await this.notificationRepository.markAsUnread(notificationId);
		if (result.modifiedCount === 0) throw new Error(i18n.t('notification.NOT_FOUND'));
		return true;
	}

	async deleteNotification(notificationId: string, i18n: I18nContext) {
		const result = await this.notificationRepository.softDelete(notificationId);
		if (result.modifiedCount === 0) throw new Error(i18n.t('notification.NOT_FOUND'));
		return true;
	}

	async clearAll(userId: string) {
		await this.notificationRepository.clearAll(userId);
		return true;
	}

	async deleteByCondition(condition: any) {
		return this.notificationRepository.deleteByCondition(condition);
	}
}
