// friend.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { IFriendRepository } from '../repositories/friend.repository';
import { FriendState } from '@common/enum/friend/friend.state.enum';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { FriendMapper } from '../mapper/friend.mapper';

@Injectable()
export class FriendService {
	constructor(
		private readonly friendRepository: IFriendRepository,
		private readonly notiService: NotificationService,
		private readonly friendMapper: FriendMapper,
	) {}

	async sendRequest(fromUserId: string, toUserId: string) {
		if (fromUserId === toUserId) {
			throw new ConflictException('friend.SELF_REQUEST');
		}

		const existed = await this.friendRepository.findBetween(fromUserId, toUserId);
		if (existed) {
			throw new ConflictException('friend.REQUEST_EXISTS');
		}

		const request = await this.friendRepository.create(fromUserId, toUserId);
		await this.notiService.friendRequestNoti(fromUserId, toUserId, FriendState.PENDING);
		return {
			message: 'friend.REQUEST_SENT',
			data: request,
		};
	}

	async respondRequest(
		toUserId: string,
		fromUserId: string,
		response: FriendState.ACCEPTED | FriendState.REJECTED,
	) {
		if (response === FriendState.REJECTED) {
			const deleted = await this.friendRepository.deleteRequest(fromUserId, toUserId);
			await this.notiService.friendRequestNoti(toUserId, fromUserId, FriendState.REJECTED);

			if (!deleted) {
				throw new NotFoundException('friend.REQUEST_NOT_FOUND');
			}
			return { message: 'friend.REQUEST_REJECTED' };
		}

		const updated = await this.friendRepository.updateState(fromUserId, toUserId, response);
		if (!updated) {
			throw new NotFoundException('friend.REQUEST_NOT_FOUND');
		}
		await this.notiService.friendRequestNoti(toUserId, fromUserId, FriendState.ACCEPTED);

		return {
			message: 'friend.REQUEST_ACCEPTED',
			data: updated,
		};
	}

	async getFriends(userId: string) {
		const friends = await this.friendRepository.getAccepted(userId);
		const res = await Promise.all(
			friends.map(friend => this.friendMapper.toResponseMyFriend(userId, friend)),
		);
		return {
			message: 'friend.FRIEND_LIST',
			data: res,
		};
	}

	async getPendingList(userId: string) {
		const pendinglist = await this.friendRepository.getPending(userId);
		const res = await Promise.all(
			pendinglist.map(pending => this.friendMapper.toResponseMyFriend(userId, pending)),
		);
		return res;
	}

	async isFriend(userId: string, friendId: string) {
		const existed = await this.friendRepository.findBetween(userId, friendId);
		if (existed?.fromUserId === userId) {
			return {
				fromMe: true,
				toUserId: existed.toUserId,
			};
		} else if (existed?.toUserId === userId) {
			return {
				fromMe: false,
				fromUserId: existed.fromUserId,
			};
		}
		return existed ? existed.state : FriendState.NONE;
	}

	async getFriendList(myId: string, userId: string) {
		const userFriends = await this.friendRepository.getAccepted(userId);
		const res = Promise.all(
			userFriends.map(async userFriend => {
				const friendId =
					userId === userFriend.fromUserId ? userFriend.toUserId : userFriend.fromUserId;
				const isMyFriend = await this.friendRepository.findBetween(myId, friendId);
				if (!isMyFriend)
					return this.friendMapper.toResponseFriendOfOthers(userId, userFriend, FriendState.NONE);
				return this.friendMapper.toResponseFriendOfOthers(userId, userFriend, isMyFriend.state);
			}),
		);
		return res;
	}
}
