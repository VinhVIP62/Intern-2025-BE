import { IProfileRepository } from '@modules/user/repositories/interfaces/profile.repository';
import { Injectable } from '@nestjs/common';
import { Friend } from '../entities/friend.schema';
import { FriendState } from '@common/enum/friend/friend.state.enum';

@Injectable()
export class FriendMapper {
	constructor(private readonly profileRepo: IProfileRepository) {}

	async toResponseMyFriend(userId: string, friend: Friend) {
		const friendId = friend.fromUserId === userId ? friend.toUserId : friend.fromUserId;
		const friendProfile = await this.profileRepo.findById(friendId);
		return {
			friendId: friendProfile.userId,
			friendFirstName: friendProfile.firstName,
			friendLastName: friendProfile.lastName,
			friendAvatarUrl: friendProfile.avatarUrl,
		};
	}

	async toResponseFriendOfOthers(userId: string, friend: Friend, state: FriendState) {
		const friendId = friend.fromUserId === userId ? friend.toUserId : friend.fromUserId;
		const friendProfile = await this.profileRepo.findById(friendId);
		return {
			friendId: friendProfile.userId,
			friendFirstName: friendProfile.firstName,
			friendLastName: friendProfile.lastName,
			friendAvatarUrl: friendProfile.avatarUrl,
			state: state ? state : FriendState.NONE,
		};
	}
}
