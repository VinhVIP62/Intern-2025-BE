import { IsNotEmpty, IsString } from 'class-validator';

export class FriendDto {
	@IsNotEmpty()
	@IsString()
	senderId: string;

	@IsNotEmpty()
	@IsString()
	receiverId: string;
}
