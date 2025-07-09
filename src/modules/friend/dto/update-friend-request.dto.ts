import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum FriendRequestAction {
	ACCEPT = 'accept',
	REJECT = 'reject',
}

export class UpdateFriendRequestDto {
	@ApiProperty({ enum: FriendRequestAction })
	@IsEnum(FriendRequestAction)
	action: FriendRequestAction;
}
