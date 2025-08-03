import { Injectable } from '@nestjs/common';
import { Notification } from '../entities/notification.schema';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class NotificationMapper {
	constructor(private readonly i18nService: I18nService) {}
	async toResponse(notification: Notification, lang = 'en') {
		const message = await this.i18nService.translate(notification.messageKey, {
			lang,
			args: notification.metadata || {},
		});
		return {
			id: notification.id,
			toUserId: notification.toUserId,
			type: notification.type,
			content: message,
			metadate: notification.metadata,
			isRead: notification.isRead,
			createdAt: notification.createdAt,
		};
	}
}
