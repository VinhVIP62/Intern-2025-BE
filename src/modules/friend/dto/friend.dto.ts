import { IsUUID, IsIn } from 'class-validator';
import { FriendState } from '@common/enum/friend.state.enum';

export class SendFriendRequestDto {
	@IsUUID()
	toUserId: string;
}

export class ResponseFriendRequestDto {
	@IsUUID()
	fromUserId: string;

	@IsIn([FriendState.ACCEPTED, FriendState.REJECTED])
	response: FriendState.ACCEPTED | FriendState.REJECTED;
}
