import { Injectable } from '@nestjs/common';
import { IFriendRepository } from '../repositories/friend.repository';
import { UserService } from '@modules/user/providers/user.service';
import { BadRequest } from '@common/exceptions';
import { IFriendRequestRepository } from '../repositories/friend-request.repository';

@Injectable()
export class FriendService {
	constructor(
		private readonly friendRepository: IFriendRepository,
		private readonly friendRequestRepository: IFriendRequestRepository,
		private readonly userService: UserService,
	) {}

	async getFriends(userId: string) {
		const friendObjectIds = await this.friendRepository.findAllByUserId(userId);
		const friendIds = friendObjectIds.map(id => id.toString());
		const friends = await this.userService.findManyByIds(friendIds);
		return friends;
	}

	async unfriend(userId: string, friendId: string) {
		const isFriend = await this.friendRepository.isFriend(userId, friendId);
		if (!isFriend) {
			throw new BadRequest('exception.friend.notFriend');
		}

		await this.friendRepository.delete(userId, friendId);

		await this.friendRequestRepository.deleteMany(userId, friendId);
	}
}
