import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString } from 'class-validator';

export class CreateBlockDto {
	@ApiProperty({ description: 'ID người bị chặn', example: '664b1d0fa1a98d5f6721aa01' })
	@IsMongoId()
	blockedUserId: string;

	@ApiProperty({ description: 'Loại hành vi bị chặn: post, message, event', example: 'post' })
	@IsString()
	blockType: 'message' | 'post' | 'event';
}
