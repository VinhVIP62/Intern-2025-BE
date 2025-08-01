import { Notification } from '../entities/notification.schema';
import { NotificationQueryDto } from '../dto/notification.query.dto';

export abstract class NotificationRepository {
	abstract createNotification(notification: Partial<Notification>): Promise<Notification>;
	abstract getNotifications(userId: string, query: NotificationQueryDto): Promise<Notification[]>;
	abstract getNotificationById(notificationId: string): Promise<Notification | null>;
	abstract updateNotification(notification: Notification): Promise<Notification | null>;
	abstract deleteNotification(notification: Notification): Promise<Notification | null>;
	abstract findOne(query: any): Promise<Notification | null>;
}
