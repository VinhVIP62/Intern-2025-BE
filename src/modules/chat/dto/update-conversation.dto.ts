import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateConversationDto {
	@ApiPropertyOptional({ description: 'Tên nhóm (nếu là group)' })
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({ description: 'Ảnh đại diện của cuộc trò chuyện' })
	@IsOptional()
	@IsUrl()
	avatarUrl?: string;
}
