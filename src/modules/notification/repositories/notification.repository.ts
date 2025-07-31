import { Notification, NotificationDocument } from '../entities/notification.schema';

export abstract class INotificationRepository {
	abstract create(data: Partial<Notification>): Promise<NotificationDocument>;

	abstract findByUser(
		userId: string,
		page: number,
		limit: number,
	): Promise<{ items: NotificationDocument[]; total: number }>;

	abstract markAsRead(notificationId: string): Promise<void>;

	abstract delete(notificationId: string): Promise<void>;
}
