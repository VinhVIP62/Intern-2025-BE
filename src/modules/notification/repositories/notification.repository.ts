export interface INotificationRepository {
	findNotificationsByUser(
		userId: string,
		page: number,
		limit: number,
		isRead?: boolean,
	): Promise<{ notifications: any[]; total: number }>;

	countUnreadNotifications(userId: string): Promise<number>;

	getUnreadNotifications(userId: string, page?: number, limit?: number): Promise<any[]>;

	markAsRead(notificationId: string): Promise<any>;

	markAllAsRead(userId: string): Promise<any>;

	markAsUnread(notificationId: string): Promise<any>;

	softDelete(notificationId: string): Promise<any>;

	clearAll(userId: string): Promise<any>;

	createNotification(data: any): Promise<any>;
}

export const INotificationRepository = Symbol('INotificationRepository');
