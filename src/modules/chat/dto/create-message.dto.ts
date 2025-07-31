import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsMongoId, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MediaItemDto {
	@ApiProperty()
	@IsString()
	url: string;

	@ApiProperty()
	@IsString()
	mimeType: string;
}

export class CreateMessageDto {
	@ApiProperty({ description: 'ID cuộc trò chuyện' })
	@IsMongoId()
	conversationId: string;

	@ApiPropertyOptional({ description: 'Nội dung tin nhắn' })
	@IsOptional()
	@IsString()
	text?: string;

	@ApiPropertyOptional({ type: [MediaItemDto] })
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => MediaItemDto)
	media?: MediaItemDto[];

	@ApiPropertyOptional({ description: 'ID tin nhắn trả lời' })
	@IsOptional()
	@IsMongoId()
	replyTo?: string;
}
