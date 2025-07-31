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

export class CreateFirstMessageDto {
	@ApiProperty({
		description: 'Danh sách userId (bao gồm user hiện tại và người muốn gửi)',
		example: ['664b1d0fa1a98d5f6721aa01', '664b1d12a1a98d5f6721aa02'],
	})
	@IsMongoId({ each: true })
	userIds: string[];

	@ApiPropertyOptional({ description: 'Nội dung tin nhắn' })
	@IsOptional()
	@IsString()
	text?: string;

	@ApiPropertyOptional({ type: [MediaItemDto] })
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => MediaItemDto)
	media?: MediaItemDto[];
}
