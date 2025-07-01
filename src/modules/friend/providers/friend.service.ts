// friend.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { IFriendRepository } from '../repositories/friend.repository';
import { FriendState } from '@common/enum/friend.state.enum';

@Injectable()
export class FriendService {
	constructor(private readonly friendRepository: IFriendRepository) {}

	async sendRequest(fromUserId: string, toUserId: string) {
		if (fromUserId === toUserId) {
			throw new ConflictException('friend.SELF_REQUEST');
		}

		const existed = await this.friendRepository.findBetween(fromUserId, toUserId);
		if (existed) {
			throw new ConflictException('friend.REQUEST_EXISTS');
		}

		const request = await this.friendRepository.create(fromUserId, toUserId);

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
			if (!deleted) {
				throw new NotFoundException('friend.REQUEST_NOT_FOUND');
			}
			return { message: 'friend.REQUEST_REJECTED' };
		}

		const updated = await this.friendRepository.updateState(fromUserId, toUserId, response);
		if (!updated) {
			throw new NotFoundException('friend.REQUEST_NOT_FOUND');
		}

		return {
			message: 'friend.REQUEST_ACCEPTED',
			data: updated,
		};
	}

	async getFriends(userId: string) {
		const friends = await this.friendRepository.getAccepted(userId);
		return {
			message: 'friend.FRIEND_LIST',
			data: friends,
		};
	}
}
