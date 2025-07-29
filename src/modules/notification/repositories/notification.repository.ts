import { Injectable } from '@nestjs/common';
import { Notification } from '../entities/notification.schema';

@Injectable()
export abstract class INotificationRepository {
	abstract create(noti: Partial<Notification>): Promise<Notification>;
	abstract getAllInfScroll(userId: string, limit: number, before?: Date): Promise<Notification[]>;
	abstract totalUnread(userId: string): Promise<number>;
	abstract getUnreadNotifications(userId: string): Promise<Notification[]>;
	abstract getById(id: string): Promise<Notification | null>;
	abstract updateRead(id: string): Promise<Notification | null>;
}
