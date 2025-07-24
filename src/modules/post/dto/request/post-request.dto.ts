import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { PostType, PostStatus, PostAccessLevel } from '@modules/post/entities/post.enum';
import { SportType } from '@modules/user/enums/user.enum';
import {
	IsString,
	IsOptional,
	IsEnum,
	IsArray,
	IsMongoId,
	MinLength,
	MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BasePaginationMetaDto } from '@common/dto/base-pagination.dto';

export class CreatePostDto {
	@ApiProperty({
		description: 'Nội dung bài đăng',
		minLength: 1,
		maxLength: 2000,
		example: 'Hôm nay tôi đã có một buổi tập tuyệt vời! #fitness #health',
	})
	@IsString()
	@MaxLength(2000, { message: 'Nội dung không được vượt quá 2000 ký tự' })
	@IsOptional()
	content?: string;

	@ApiProperty({
		enum: PostType,
		description: 'Loại bài đăng',
		default: PostType.TEXT,
		example: [PostType.TEXT, PostType.IMAGE, PostType.VIDEO, PostType.EVENT],
	})
	@IsEnum(PostType)
	@IsOptional()
	type?: PostType = PostType.TEXT;

	@ApiProperty({
		enum: SportType,
		description: 'Môn thể thao liên quan',
		example: SportType.FOOTBALL,
	})
	@IsOptional()
	@IsEnum(SportType)
	sport?: SportType;

	@ApiProperty({
		enum: PostStatus,
		description: 'Trạng thái duyệt bài',
		example: PostStatus.APPROVED,
	})
	@IsEnum(PostStatus)
	@IsOptional()
	approvalStatus?: PostStatus = PostStatus.APPROVED;

	@ApiProperty({
		description: 'ID sự kiện liên quan',
		required: false,
		example: '507f1f77bcf86cd799439011',
	})
	@IsOptional()
	@IsMongoId()
	eventId?: string;

	@ApiProperty({
		description: 'ID nhóm liên quan',
		required: false,
		example: '507f1f77bcf86cd799439011',
	})
	@IsOptional()
	@IsMongoId()
	groupId?: string;

	@ApiProperty({
		type: [String],
		description: 'Danh sách ID người dùng được tag',
		required: false,
		example: ['507f1f77bcf86cd799439011'],
	})
	@IsOptional()
	@IsArray()
	@IsMongoId({ each: true })
	@Transform(({ value }) => {
		// Handle multipart/form-data array serialization
		if (typeof value === 'string') {
			try {
				// Try to parse as JSON string
				return JSON.parse(value);
			} catch {
				// If not JSON, treat as single value
				return [value];
			}
		}
		// If already array, return as is
		return Array.isArray(value) ? value : [];
	})
	taggedUsers?: string[];

	@ApiProperty({
		description: 'ID bài đăng được share từ',
		required: false,
		example: '507f1f77bcf86cd799439011',
	})
	@IsOptional()
	@IsMongoId()
	sharedFrom?: string;

	@ApiProperty({
		enum: PostAccessLevel,
		description: 'Quyền truy cập bài đăng',
		default: PostAccessLevel.PUBLIC,
		example: [PostAccessLevel.PUBLIC, PostAccessLevel.PRIVATE, PostAccessLevel.PROTECTED],
		required: false,
	})
	@IsOptional()
	@IsEnum(PostAccessLevel)
	accessLevel?: PostAccessLevel = PostAccessLevel.PUBLIC;
}

export class UpdatePostDto {
	@ApiProperty({
		description: 'Nội dung bài đăng',
		minLength: 1,
		maxLength: 2000,
		required: false,
		example: 'Hôm nay tôi đã có một buổi tập tuyệt vời! #fitness #health',
	})
	@IsOptional()
	@IsString()
	@MinLength(1, { message: 'Nội dung không được để trống' })
	@MaxLength(2000, { message: 'Nội dung không được vượt quá 2000 ký tự' })
	content?: string;

	@ApiProperty({
		enum: SportType,
		description: 'Môn thể thao liên quan',
		required: false,
		example: SportType.FOOTBALL,
	})
	@IsOptional()
	@IsEnum(SportType)
	sport?: SportType;

	@ApiProperty({
		description: 'ID sự kiện liên quan',
		required: false,
		example: '507f1f77bcf86cd799439011',
	})
	@IsOptional()
	@IsMongoId()
	eventId?: string;

	@ApiProperty({
		description: 'ID nhóm liên quan',
		required: false,
		example: '507f1f77bcf86cd799439011',
	})
	@IsOptional()
	@IsMongoId()
	groupId?: string;

	@ApiProperty({
		type: [String],
		description: 'Danh sách ID người dùng được tag',
		required: false,
		example: ['507f1f77bcf86cd799439011'],
	})
	@IsOptional()
	@IsArray()
	@IsMongoId({ each: true })
	@Transform(({ value }) => {
		// Handle multipart/form-data array serialization
		if (typeof value === 'string') {
			try {
				// Try to parse as JSON string
				return JSON.parse(value);
			} catch {
				// If not JSON, treat as single value
				return [value];
			}
		}
		// If already array, return as is
		return Array.isArray(value) ? value : [];
	})
	taggedUsers?: string[];

	@ApiProperty({
		enum: PostAccessLevel,
		description: 'Quyền truy cập bài đăng',
		default: PostAccessLevel.PUBLIC,
		required: false,
	})
	@IsOptional()
	@IsEnum(PostAccessLevel)
	accessLevel?: PostAccessLevel;

	@ApiProperty({ description: 'Các url cũ', required: false })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Transform(({ value }) =>
		Array.isArray(value) ? value
		: value ? [value]
		: [],
	)
	oldUrls?: string[];
}

export class ClearUrlDto {
	@ApiProperty({ description: 'Xóa images', required: false, default: false })
	@IsOptional()
	isClearImage?: boolean = false;

	@ApiProperty({ description: 'Xóa video', required: false, default: false })
	@IsOptional()
	isClearVideo?: boolean = false;
}
