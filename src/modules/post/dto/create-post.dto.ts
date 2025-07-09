import { PostVisibility } from '@common/enum/post-visibility.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
	@ApiProperty({ description: 'Tiêu đề bài viết' })
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({ description: 'Nội dung bài viết' })
	@IsString()
	@IsNotEmpty()
	content: string;

	@ApiPropertyOptional({ type: [String], description: 'Danh sách URL hình ảnh' })
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	imageUrls?: string[];

	@ApiPropertyOptional({ enum: PostVisibility, default: PostVisibility.Public })
	@IsEnum(PostVisibility)
	@IsOptional()
	visibility?: PostVisibility;
}
