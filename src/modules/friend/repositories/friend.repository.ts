import { Injectable } from '@nestjs/common';
import { Friend } from '../entities/friend.schema';
import { FriendState } from '@common/enum/friend.state.enum';

@Injectable()
export abstract class IFriendRepository {
	abstract create(fromUserId: string, toUserId: string): Promise<Friend>;
	abstract findOne(fromUserId: string, toUserId: string): Promise<Friend | null>;
	abstract findBetween(fromUserId: string, toUserId: string): Promise<Friend | null>;
	abstract updateState(
		fromUserId: string,
		toUserId: string,
		state: FriendState,
	): Promise<Friend | null>;
	abstract getAccepted(userId: string): Promise<Friend[]>;
	abstract deleteRequest(fromUserId: string, toUserId: string): Promise<Friend | null>;
}
