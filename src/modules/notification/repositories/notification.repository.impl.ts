import { Injectable } from '@nestjs/common';
import { INotificationRepository } from './notification.repository';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from '../entities/notification.schema';
import { Post, PostSchema } from '../../post/entities/post.schema';
import { Event, EventSchema } from '../../event/entities/event.schema';
import { Group, GroupSchema } from '../../group/entities/group.schema';
import { Comment, CommentSchema } from '../../comment/entities/comment.schema';
import { User, UserSchema } from '../../user/entities/user.schema';
import { Achievement, AchievementSchema } from '../../achievement/entities/achievement.schema';
import {
	FriendRequest,
	FriendRequestSchema,
} from '../../friend-request/entities/friend-request.schema';

@Injectable()
export class NotificationRepositoryImpl implements INotificationRepository {
	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<Notification>,
	) {}

	async findNotificationsByUser(
		userId: string,
		page: number = 1,
		limit: number = 10,
		isRead?: boolean,
	) {
		const filter: any = { recipient: userId, isActive: true };
		if (typeof filter.recipient === 'string') {
			filter.recipient = new Types.ObjectId(filter.recipient);
		}
		if (typeof isRead === 'boolean' && isRead !== undefined) filter.isRead = isRead;

		const [notifications, total] = await Promise.all([
			this.notificationModel
				.find(filter)
				.sort({ createdAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.populate('senderUser', 'firstName lastName avatar fullName _id')
				.populate('recipientUser', 'firstName lastName avatar fullName _id')
				.lean({ virtuals: true }),
			this.notificationModel.countDocuments(filter),
		]);

		// Manually populate referenced documents based on referenceModel
		const populatedNotifications = await Promise.all(
			notifications.map(async notification => {
				if (notification.referenceId && notification.referenceModel) {
					let referencedDoc: any = null;

					switch (notification.referenceModel) {
						case 'Post':
							const PostModel = this.notificationModel.db.model('Post', PostSchema);
							referencedDoc = await PostModel.findById(notification.referenceId)
								.select('title _id')
								.lean();
							if (referencedDoc) {
								(notification as any).referencedPost = referencedDoc;
							}
							break;

						case 'Event':
							const EventModel = this.notificationModel.db.model('Event', EventSchema);
							referencedDoc = await EventModel.findById(notification.referenceId)
								.select('name avatar _id')
								.lean();
							if (referencedDoc) {
								(notification as any).referencedEvent = referencedDoc;
							}
							break;

						case 'Group':
							const GroupModel = this.notificationModel.db.model('Group', GroupSchema);
							referencedDoc = await GroupModel.findById(notification.referenceId)
								.select('name avatar _id')
								.lean();
							if (referencedDoc) {
								(notification as any).referencedGroup = referencedDoc;
							}
							break;

						case 'Comment':
							const CommentModel = this.notificationModel.db.model('Comment', CommentSchema);
							referencedDoc = await CommentModel.findById(notification.referenceId)
								.select('content postId _id')
								.lean();
							if (referencedDoc) {
								(notification as any).referencedComment = referencedDoc;
							}
							break;

						case 'User':
							const UserModel = this.notificationModel.db.model('User', UserSchema);
							referencedDoc = await UserModel.findById(notification.referenceId)
								.select('firstName lastName avatar fullName _id')
								.lean();
							if (referencedDoc) {
								(notification as any).referencedUser = referencedDoc;
							}
							break;

						case 'Achievement':
							// TODO: Implement achievement reference
							const AchievementModel = this.notificationModel.db.model(
								'Achievement',
								AchievementSchema,
							);
							referencedDoc = await AchievementModel.findById(notification.referenceId)
								.select('name _id')
								.lean();
							if (referencedDoc) {
								(notification as any).referencedAchievement = referencedDoc;
							}
							break;

						case 'FriendRequest':
							const FriendRequestModel = this.notificationModel.db.model(
								'FriendRequest',
								FriendRequestSchema,
							);
							referencedDoc = await FriendRequestModel.findById(notification.referenceId)
								.select('status _id')
								.lean();
							if (referencedDoc) {
								(notification as any).referencedFriendRequest = referencedDoc;
							}
							break;
					}
				}

				return notification;
			}),
		);

		return { notifications: populatedNotifications, total };
	}

	async markAsRead(notificationId: string) {
		return this.notificationModel.updateOne(
			{ _id: new Types.ObjectId(notificationId) },
			{ $set: { isRead: true } },
		);
	}

	async markAllAsRead(userId: string) {
		const filter: any = { recipient: userId, isActive: true, isRead: false };
		if (typeof filter.recipient === 'string') {
			filter.recipient = new Types.ObjectId(filter.recipient);
		}
		return this.notificationModel.updateMany(filter, { $set: { isRead: true } });
	}

	async markAsUnread(notificationId: string) {
		return this.notificationModel.updateOne(
			{ _id: new Types.ObjectId(notificationId) },
			{ $set: { isRead: false } },
		);
	}

	async softDelete(notificationId: string) {
		return this.notificationModel.deleteOne({ _id: new Types.ObjectId(notificationId) });
	}

	async clearAll(userId: string) {
		const filter: any = { recipient: userId, isActive: true };
		if (typeof filter.recipient === 'string') {
			filter.recipient = new Types.ObjectId(filter.recipient);
		}
		return this.notificationModel.deleteMany(filter);
	}

	async deleteByCondition(condition: any) {
		const cond = { ...condition };
		if (cond.recipient && typeof cond.recipient === 'string') {
			cond.recipient = new Types.ObjectId(cond.recipient);
		}
		if (cond.referenceId && typeof cond.referenceId === 'string') {
			cond.referenceId = new Types.ObjectId(cond.referenceId);
		}
		if (Array.isArray(cond.recipient)) {
			cond.recipient = cond.recipient.map((id: any) =>
				typeof id === 'string' ? new Types.ObjectId(id) : id,
			);
		}
		if (Array.isArray(cond.referenceId)) {
			cond.referenceId = cond.referenceId.map((id: any) =>
				typeof id === 'string' ? new Types.ObjectId(id) : id,
			);
		}
		return this.notificationModel.deleteMany(cond);
	}

	async createNotification(data: any) {
		if (data.recipient && !(data.recipient instanceof Types.ObjectId)) {
			data.recipient = Types.ObjectId.createFromHexString(data.recipient);
		}
		if (data.sender && !(data.sender instanceof Types.ObjectId)) {
			data.sender = Types.ObjectId.createFromHexString(data.sender);
		}
		if (data.referenceId && !(data.referenceId instanceof Types.ObjectId)) {
			data.referenceId = Types.ObjectId.createFromHexString(data.referenceId);
		}
		const notification = new this.notificationModel(data);
		return await notification.save();
	}
}
