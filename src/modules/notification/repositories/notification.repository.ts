export interface INotificationRepository {
	findNotificationsByUser(
		userId: string,
		page: number,
		limit: number,
		isRead?: boolean,
	): Promise<{ notifications: any[]; total: number }>;

	markAsRead(notificationId: string): Promise<any>;

	markAllAsRead(userId: string): Promise<any>;

	markAsUnread(notificationId: string): Promise<any>;

	softDelete(notificationId: string): Promise<any>;

	clearAll(userId: string): Promise<any>;

	createNotification(data: any): Promise<any>;

	deleteByCondition(condition: any): Promise<any>;
}

export const INotificationRepository = Symbol('INotificationRepository');
