import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsArray,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class MediaItemDto {
	@ApiProperty()
	@IsString()
	url: string;

	@ApiProperty()
	@IsString()
	mimeType: string;
}

export class CreateCommentDto {
	@ApiProperty({ description: 'ID bài viết cần bình luận' })
	@IsMongoId()
	postId: string;

	@ApiPropertyOptional({ description: 'ID comment cha (nếu là phản hồi)' })
	@IsMongoId()
	@IsOptional()
	parentCommentId?: string;

	@ApiProperty({ description: 'Nội dung bình luận' })
	@IsString()
	@IsNotEmpty()
	content: string;

	@ApiPropertyOptional({ type: [MediaItemDto] })
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => MediaItemDto)
	media?: MediaItemDto[];

	@ApiPropertyOptional({
		description: 'Danh sách ID của bạn bè được gắn thẻ',
		type: [String],
		example: ['60d21b4667d0d8992e610c85', '60d21b4967d0d8992e610c86'],
	})
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	taggedFriends?: string[];

	@ApiPropertyOptional({
		description: 'Danh sách ID của bạn bè được nhắc tên',
		type: [String],
		example: ['60d21b4667d0d8992e610c85', '60d21b4967d0d8992e610c86'],
	})
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	mentionedFriends?: string[];
}
