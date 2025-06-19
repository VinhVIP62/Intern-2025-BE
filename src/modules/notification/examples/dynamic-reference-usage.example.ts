import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationType, ReferenceModel } from '../entities';

@Injectable()
export class NotificationService {
	constructor(@InjectModel(Notification.name) private notificationModel: Model<Notification>) {}

	// Tạo notification với dynamic reference
	async createNotification(data: {
		recipient: string;
		sender: string;
		type: NotificationType;
		title: string;
		message: string;
		referenceId?: string;
		referenceModel?: ReferenceModel;
	}) {
		const notification = new this.notificationModel(data);
		return await notification.save();
	}

	// Lấy notifications với dynamic populate
	async getNotificationsWithReferences(userId: string) {
		return await this.notificationModel
			.find({ recipient: userId, isActive: true })
			.populate('recipientUser', 'firstName lastName avatar')
			.populate('senderUser', 'firstName lastName avatar')
			.populate('referencedDocument') // Dynamic populate based on referenceModel
			.sort({ createdAt: -1 })
			.exec();
	}

	// Lấy notifications theo loại reference cụ thể
	async getNotificationsByReferenceType(userId: string, referenceModel: ReferenceModel) {
		return await this.notificationModel
			.find({
				recipient: userId,
				referenceModel: referenceModel,
				isActive: true,
			})
			.populate('recipientUser', 'firstName lastName avatar')
			.populate('senderUser', 'firstName lastName avatar')
			.populate('referencedDocument')
			.sort({ createdAt: -1 })
			.exec();
	}

	// Ví dụ tạo notification cho like post
	async createLikeNotification(postId: string, postAuthorId: string, likerId: string) {
		return await this.createNotification({
			recipient: postAuthorId,
			sender: likerId,
			type: NotificationType.LIKE,
			title: 'New Like',
			message: 'Someone liked your post',
			referenceId: postId,
			referenceModel: ReferenceModel.POST,
		});
	}

	// Ví dụ tạo notification cho comment
	async createCommentNotification(
		commentId: string,
		postId: string,
		postAuthorId: string,
		commenterId: string,
	) {
		return await this.createNotification({
			recipient: postAuthorId,
			sender: commenterId,
			type: NotificationType.COMMENT,
			title: 'New Comment',
			message: 'Someone commented on your post',
			referenceId: commentId,
			referenceModel: ReferenceModel.COMMENT,
		});
	}

	// Ví dụ tạo notification cho friend request
	async createFriendRequestNotification(requestId: string, recipientId: string, senderId: string) {
		return await this.createNotification({
			recipient: recipientId,
			sender: senderId,
			type: NotificationType.FRIEND_REQUEST,
			title: 'Friend Request',
			message: 'You have a new friend request',
			referenceId: requestId,
			referenceModel: ReferenceModel.FRIEND_REQUEST,
		});
	}

	// Lấy notification với reference cụ thể (Post)
	async getPostNotifications(userId: string) {
		return await this.notificationModel
			.find({
				recipient: userId,
				referenceModel: ReferenceModel.POST,
				isActive: true,
			})
			.populate('recipientUser', 'firstName lastName avatar')
			.populate('senderUser', 'firstName lastName avatar')
			.populate('referencedPost') // Chỉ populate Post
			.sort({ createdAt: -1 })
			.exec();
	}

	// Lấy notification với reference cụ thể (Event)
	async getEventNotifications(userId: string) {
		return await this.notificationModel
			.find({
				recipient: userId,
				referenceModel: ReferenceModel.EVENT,
				isActive: true,
			})
			.populate('recipientUser', 'firstName lastName avatar')
			.populate('senderUser', 'firstName lastName avatar')
			.populate('referencedEvent') // Chỉ populate Event
			.sort({ createdAt: -1 })
			.exec();
	}
}
