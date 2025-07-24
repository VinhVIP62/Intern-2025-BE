import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';

export class CreateFriendRequestDto {
	@ApiProperty({
		description: 'ID của người nhận lời mời kết bạn',
		example: '507f1f77bcf86cd799439011',
	})
	@IsString()
	recipientId: string;

	@ApiProperty({
		description: 'Tin nhắn kèm theo lời mời kết bạn',
		example: 'Xin chào! Tôi muốn kết bạn với bạn.',
		required: false,
	})
	@IsOptional()
	@IsString()
	message?: string;
}
