import { PostVisibility } from '@common/enum/post-visibility.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsArray,
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';

class MediaItemDto {
	@ApiProperty()
	@IsString()
	url: string;

	@ApiProperty()
	@IsString()
	mimeType: string;
}

export class CreatePostDto {
	@ApiProperty({ description: 'Tiêu đề bài viết' })
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({ description: 'Nội dung bài viết' })
	@IsString()
	@IsNotEmpty()
	content: string;

	@ApiPropertyOptional({ type: [MediaItemDto] })
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => MediaItemDto)
	media?: MediaItemDto[];

	@ApiPropertyOptional({
		description: 'Danh sách ID môn thể thao',
		example: ['665a7e1e81ab123456789012', '665a7e1e81ab123456789013'],
		type: [String],
	})
	@IsOptional()
	@IsMongoId({ each: true })
	sports?: string[];

	@ApiPropertyOptional({
		description: 'Địa chỉ người dùng (tọa độ + thông tin)',
		example: {
			coordinates: [106.660172, 10.762622],
			address: '123 Lê Lợi, Quận 1',
			city: 'Hồ Chí Minh',
			district: 'Quận 1',
		},
	})
	@IsOptional()
	location?: {
		type: 'Point';
		coordinates: [number, number];
		address: string;
		city: string;
		district: string;
	};

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
		description: 'ID của bài viết gốc',
		type: String,
		example: '60d21b4667d0d8992e610c85',
	})
	@IsOptional()
	@IsMongoId()
	sharedPost?: string;

	@ApiPropertyOptional({ enum: PostVisibility, default: PostVisibility.Public })
	@IsEnum(PostVisibility)
	@IsOptional()
	visibility?: PostVisibility;
}
