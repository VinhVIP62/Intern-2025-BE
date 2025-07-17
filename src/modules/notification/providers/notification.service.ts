import { Injectable } from '@nestjs/common';
import { INotificationRepository } from '../repositories/notification.repository';
import { I18nContext } from 'nestjs-i18n';
import { CreateNotificationDto } from '../dto/notification.dto';
import admin from '../../../firebase';
import { IUserRepository } from '../../user/repositories/user.repository';
import { NOTIFICATION_MESSAGE_KEYS } from '@common/constants/message-key.constant';
import { IGroupRepository } from '../../group/repositories/group.repository';
import { IPostRepository } from '../../post/repositories/post.repository';
import { ICommentRepository } from '../../comment/repositories/comment.repository';
import { ReferenceModel } from '../entities/notification.enum';
// Nếu có Event/Achievement repository thì import tương tự

@Injectable()
export class NotificationService {
	constructor(
		private readonly notificationRepository: INotificationRepository,
		private readonly userRepository: IUserRepository,
		private readonly groupRepository: IGroupRepository,
		private readonly postRepository: IPostRepository,
		private readonly commentRepository: ICommentRepository,
		// Nếu có eventRepository, achievementRepository thì inject tương tự
	) {}

	async createNotification(data: CreateNotificationDto, i18n: I18nContext) {
		const notification = await this.notificationRepository.createNotification(data);
		// Lấy FCM token của user nhận qua repository
		const recipient = await this.userRepository.findOneById(data.recipient);
		if (recipient?.fcmToken) {
			await admin.messaging().send({
				token: recipient.fcmToken,
				notification: {
					title: i18n ? i18n.t('notification.NEW_NOTIFICATION') : 'New Notification',
					body: await this.translateNotificationMessage(
						data.message,
						i18n,
						data.sender,
						data.referenceModel,
						data.referenceId,
					),
				},
				data: {
					notificationId: notification._id.toString(),
				},
			});
		}
		return notification;
	}

	/**
	 * Helper function to translate notification message
	 */
	public async translateNotificationMessage(
		message: string,
		i18n: I18nContext,
		sender?: string,
		referenceModel?: string,
		referenceId?: string,
	): Promise<string> {
		let translatedMessage = message;

		// Tìm và thay thế các i18n key trong message
		NOTIFICATION_MESSAGE_KEYS.forEach(key => {
			if (translatedMessage.includes(key)) {
				try {
					const translatedValue = i18n ? i18n.t(`notification.${key}`) : key;
					translatedMessage = translatedMessage.replace(key, translatedValue);
				} catch (error) {
					console.warn(`Translation key not found: notification.${key}`);
				}
			}
		});

		if (!sender || !referenceModel || !referenceId) {
			return translatedMessage;
		}

		// Tìm tất cả các @Id trong message
		const atIdMatches = [...translatedMessage.matchAll(/@(\w{24})/g)];
		for (const match of atIdMatches) {
			const id = match[1];
			let name = '';

			// Thử tìm user theo Id
			const user = await this.userRepository.findOneById(id);
			if (user) {
				name =
					user.fullName ? user.fullName : `${user.firstName || ''} ${user.lastName || ''}`.trim();
			} else if (referenceModel && referenceId) {
				// Nếu không phải user, thử tìm theo referenceModel
				switch (referenceModel) {
					case ReferenceModel.GROUP: {
						const group = await this.groupRepository.getGroupById(id);
						if (group) name = group.name;
						break;
					}
					case ReferenceModel.POST: {
						const post = await this.postRepository.findById(id);
						if (post) name = post.content || '';
						break;
					}
					case ReferenceModel.COMMENT: {
						const comment = await this.commentRepository.findCommentById(id);
						if (comment) name = comment.content || '';
						break;
					}
					case ReferenceModel.EVENT: {
						// TODO: Inject eventRepository và lấy tên event
						// const event = await this.eventRepository.findById(id);
						// if (event) name = event.name;
						break;
					}
					case ReferenceModel.ACHIEVEMENT: {
						// TODO: Inject achievementRepository và lấy tên achievement
						// const achievement = await this.achievementRepository.findById(id);
						// if (achievement) name = achievement.title;
						break;
					}
					case ReferenceModel.FRIEND_REQUEST: {
						// TODO: Inject friendRequestRepository và lấy thông tin friend request
						// const request = await this.friendRequestRepository.findById(id);
						// if (request) name = 'Friend Request';
						break;
					}
					case ReferenceModel.USER: {
						const user = await this.userRepository.findOneById(id);
						if (user)
							name =
								user.fullName ?
									user.fullName
								:	`${user.firstName || ''} ${user.lastName || ''}`.trim();
						break;
					}
					default:
						break;
				}
			}
			if (name) {
				translatedMessage = translatedMessage.replace(`@${id}`, name);
			}
		}
		return translatedMessage;
	}

	async getNotifications(userId: string, page: number, limit: number, isRead: boolean | undefined) {
		return this.notificationRepository.findNotificationsByUser(userId, page, limit, isRead);
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

	async deleteByCondition(condition: any) {
		return this.notificationRepository.deleteByCondition(condition);
	}
}
