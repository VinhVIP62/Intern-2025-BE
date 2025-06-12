import { Notification } from '../../entities/notification.entity';
import { IBaseRepository } from './base.repository.interface';

export interface INotificationRepository extends IBaseRepository<Notification> {
  findByRecipient(recipientId: string): Promise<Notification[]>;
  findBySender(senderId: string): Promise<Notification[]>;
  findByType(type: string): Promise<Notification[]>;
  findByReference(referenceId: string, referenceModel: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<boolean>;
  markAllAsRead(recipientId: string): Promise<boolean>;
  setActive(notificationId: string, isActive: boolean): Promise<boolean>;
  deleteOldNotifications(days: number): Promise<boolean>;
}
