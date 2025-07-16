import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../entities/notification.schema';
import { NotificationType, ReferenceModel } from '../entities/notification.enum';
import { INotificationRepository } from '../repositories/notification.repository';
import { I18nContext } from 'nestjs-i18n';
import { CreateNotificationDto } from '../dto/notification.dto';

@Injectable()
export class NotificationService {
	constructor(private readonly notificationRepository: INotificationRepository) {}

	async createNotification(data: CreateNotificationDto) {
		return await this.notificationRepository.createNotification(data);
	}

	async getNotifications(userId: string, page: number, limit: number, isRead: boolean | undefined) {
		return this.notificationRepository.findNotificationsByUser(userId, page, limit, isRead);
	}

	async getUnreadCount(userId: string) {
		return this.notificationRepository.countUnreadNotifications(userId);
	}

	async getUnreadNotificationsWithCount(userId: string, page?: number, limit?: number) {
		const [count, notifications] = await Promise.all([
			this.notificationRepository.countUnreadNotifications(userId),
			this.notificationRepository.getUnreadNotifications(userId, page, limit),
		]);
		return { count, notifications };
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
}
