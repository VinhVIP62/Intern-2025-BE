import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateFriendRequestDto {
	@ApiProperty({ description: 'ID của người nhận lời mời kết bạn' })
	@IsMongoId({ message: 'validation.friendRequest.receiver.invalid' })
	@IsNotEmpty({ message: 'validation.friendRequest.receiver.required' })
	receiver: string;
}
