import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { INotificationRepository } from '../repositories/notification.repository';
import { NotificationMapper } from '../mapper/notification.mapper';
import { NotificationType } from '@common/enum/notification/notification.type.enum';
import { IUserRepository } from '@modules/user/repositories/interfaces/user.repository';
import { IProfileRepository } from '@modules/user/repositories/interfaces/profile.repository';
import { IEventRepository } from '@modules/event/repositories/event.repository';
import { IPostRepository } from '@modules/post/repositories/interfaces/post.repository';
import { RealtimeGateway } from 'src/websocket/gateway';
import { FriendState } from '@common/enum/friend/friend.state.enum';
import { RSVP } from '@common/enum/event/event.member.enum';
import { Cron } from '@nestjs/schedule';
import { IEventMemberRepository } from '@modules/event/repositories/eventmember.repository';

@Injectable()
export class NotificationService {
	constructor(
		private readonly notiRepo: INotificationRepository,
		private readonly notiMapper: NotificationMapper,
		private readonly userRepo: IUserRepository,
		private readonly profileRepo: IProfileRepository,
		private readonly eventRepo: IEventRepository,
		private readonly eventMemberRepo: IEventMemberRepository,
		private readonly postRepo: IPostRepository,
		private readonly gateWay: RealtimeGateway,
	) {}

	async getNotification(userId: string, limit: number, before?: Date, lang = 'en') {
		const notifications = await this.notiRepo.getAllInfScroll(userId, limit, before);
		const res = await Promise.all(
			notifications.map(notification => this.notiMapper.toResponse(notification, lang)),
		);
		return res;
	}

	async getUnreadNotification(userId: string, lang = 'en') {
		const notifications = await this.notiRepo.getUnreadNotifications(userId);
		const res = await Promise.all(
			notifications.map(notification => this.notiMapper.toResponse(notification, lang)),
		);
		return res;
	}

	async updateReadNotification(userId: string, notificationId: string, lang = 'en') {
		const notification = await this.notiRepo.getById(notificationId);
		if (!notification || notification.toUserId !== userId) {
			throw new NotFoundException('notification.NOT_FOUND');
		}

		const updatedNotification = await this.notiRepo.updateRead(notificationId);
		if (!updatedNotification) {
			throw new ConflictException('notification.UPDATE_FAILED');
		}

		return this.notiMapper.toResponse(updatedNotification, lang);
	}

	async postTaggedUserNoti(ownerId: string, postId: string, taggedUserId: string) {
		const type = NotificationType.POST;
		const ownerProfile = await this.profileRepo.findById(ownerId);
		const post = await this.postRepo.findById(postId);
		const postTitle = post?.title.replace(/@([a-zA-Z0-9-_]+)/g, '@...');

		const metaData = {
			fromUserName: ownerProfile.userId,
			postTitle: postTitle,
			postId: post?.id,
		};
		const create = await this.notiRepo.create({
			toUserId: taggedUserId,
			messageKey: 'notification.tagged_with_title',
			metadata: metaData,
			type: type,
		});
		const response = await this.notiMapper.toResponse(create);
		await this.gateWay.sendNotificationToUser(taggedUserId, response);
	}

	async friendRequestNoti(ownerId: string, toUserId: string, state: FriendState) {
		const type = NotificationType.FRIEND_REQUEST;
		const ownerProfile = await this.profileRepo.findById(ownerId);
		let messageKey: string | null = null;

		if (state === FriendState.PENDING) {
			messageKey = 'notification.friend_request_pending';
		} else if (state === FriendState.ACCEPTED) {
			messageKey = 'notification.friend_request_accepted';
		} else if (state === FriendState.REJECTED) {
			messageKey = 'notification.friend_request_rejected';
		}

		if (!messageKey) return;

		const metadata = {
			fromUserName: ownerProfile.firstName + ' ' + ownerProfile.lastName,
		};

		const create = await this.notiRepo.create({
			toUserId: toUserId,
			messageKey: messageKey,
			metadata: metadata,
			type: type,
		});

		const response = await this.notiMapper.toResponse(create);
		await this.gateWay.sendNotificationToUser(toUserId, response);
	}

	async deleteEventNoti(userId: string, eventId: string) {
		const type = NotificationType.EVENT;
		const event = await this.eventRepo.getEventById(eventId);
		if (!event) return;
		const metadata = {
			eventId: event.id,
			eventTitle: event.title,
		};
		const create = await this.notiRepo.create({
			toUserId: userId,
			messageKey: 'notification.event_deleted',
			metadata,
			type,
		});
		const response = await this.notiMapper.toResponse(create);
		await this.gateWay.sendNotificationToUser(userId, response);
	}

	async within24hEventNoti(userId: string, eventId: string) {
		const type = NotificationType.SYSTEM;
		const event = await this.eventRepo.getEventById(eventId);
		if (!event) return;
		const metadata = {
			eventId: event.id,
			eventTitle: event.title,
		};
		const create = await this.notiRepo.create({
			toUserId: userId,
			messageKey: 'notification.event_within_24h',
			metadata,
			type,
		});
		const response = await this.notiMapper.toResponse(create);
		await this.gateWay.sendNotificationToUser(userId, response);
	}

	async inviteToEventNoti(toUserId: string, eventId: string, inviterId: string) {
		const type = NotificationType.EVENT;
		const inviter = await this.profileRepo.findById(inviterId);
		const event = await this.eventRepo.getEventById(eventId);
		if (!event) return;
		const metadata = {
			fromUserName: `${inviter.firstName} ${inviter.lastName}`,
			eventId: event.id,
			eventTitle: event.title,
		};

		const create = await this.notiRepo.create({
			toUserId,
			messageKey: 'notification.event_invited',
			metadata,
			type,
		});

		const response = await this.notiMapper.toResponse(create);
		await this.gateWay.sendNotificationToUser(toUserId, response);
	}

	async rsvpReplyNoti(ownerId: string, userId: string, eventId: string, rsvp: RSVP) {
		const type = NotificationType.EVENT;
		const user = await this.profileRepo.findById(userId);
		const event = await this.eventRepo.getEventById(eventId);
		if (!event) return;
		const metadata = {
			fromUserName: `${user.firstName} ${user.lastName}`,
			eventId: event.id,
			eventTitle: event.title,
			rsvp: rsvp.toString(),
		};

		const create = await this.notiRepo.create({
			toUserId: ownerId,
			messageKey: 'notification.event_rsvp_reply',
			metadata,
			type,
		});

		const response = await this.notiMapper.toResponse(create);
		await this.gateWay.sendNotificationToUser(ownerId, response);
	}

	async interestNoti(userId: string, eventId: string) {
		const type = NotificationType.EVENT;
		const user = await this.profileRepo.findById(userId);
		const event = await this.eventRepo.getEventById(eventId);
		if (!event) return;
		if (!user) return;
		const metadata = {
			fromUserName: `${user.firstName} ${user.lastName}`,
			eventId: event.id,
			eventTitle: event.title,
		};

		const create = await this.notiRepo.create({
			toUserId: event.ownerId,
			messageKey: 'notification.event_interest',
			metadata,
			type,
		});

		const response = await this.notiMapper.toResponse(create);
		await this.gateWay.sendNotificationToUser(event.ownerId, response);
	}

	async requestJoinNoti(userId: string, eventId: string) {
		const type = NotificationType.EVENT;
		const user = await this.profileRepo.findById(userId);
		const event = await this.eventRepo.getEventById(eventId);
		if (!event) return;
		if (!user) return;
		const metadata = {
			fromUserName: `${user.firstName} ${user.lastName}`,
			eventId: event.id,
			eventTitle: event.title,
		};

		const create = await this.notiRepo.create({
			toUserId: event.ownerId,
			messageKey: 'notification.event_join_request',
			metadata,
			type,
		});

		const response = await this.notiMapper.toResponse(create);
		await this.gateWay.sendNotificationToUser(event.ownerId, response);
	}

	async replyRequestToEventNoti(ownerId: string, userId: string, eventId: string, rsvp: RSVP) {
		const type = NotificationType.EVENT;
		const user = await this.profileRepo.findById(userId);
		const event = await this.eventRepo.getEventById(eventId);
		if (!event) return;
		if (!user) return;
		const metadata = {
			fromUserName: `${user.firstName} ${user.lastName}`,
			eventId: event.id,
			eventTitle: event.title,
			rsvp: rsvp.toString(),
		};

		const create = await this.notiRepo.create({
			toUserId: ownerId,
			messageKey: 'notification.event_reply_request',
			metadata,
			type,
		});

		const response = await this.notiMapper.toResponse(create);
		await this.gateWay.sendNotificationToUser(ownerId, response);
	}

	@Cron('0 0 0 * * *')
	async eventWithin24hNoti() {
		const events = await this.eventRepo.allEventsWithin24h();
		if (!events || events.length === 0) return;
		await Promise.all(
			events.map(async event => {
				const members = await this.eventMemberRepo.getByEventIdAndState(event.id, RSVP.ACCEPTED);
				if (!members || members.length === 0) return;
				await Promise.all(
					members.map(async member => {
						console.log(member.memberId);
						const create = await this.notiRepo.create({
							toUserId: member.memberId,
							messageKey: 'notification.event_within_24h',
							metadata: {
								eventId: event.id,
								eventTitle: event.title,
							},
							type: NotificationType.EVENT,
						});
						const response = await this.notiMapper.toResponse(create);
						await this.gateWay.sendNotificationToUser(member.memberId, response);
					}),
				);
			}),
		);
	}
}
