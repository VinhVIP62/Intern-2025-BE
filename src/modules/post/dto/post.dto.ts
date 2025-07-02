import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { PostType, PostStatus, PostAccessLevel } from '../entities/post.enum';
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

export class PostResponseDto {
	@ApiProperty({ description: 'ID của bài đăng' })
	_id: string;

	@ApiProperty({ description: 'ID của tác giả' })
	author: Types.ObjectId;

	@ApiProperty({ description: 'Nội dung bài đăng' })
	content: string;

	@ApiProperty({ enum: PostType, description: 'Loại bài đăng' })
	type: PostType;

	@ApiProperty({ type: [String], description: 'Danh sách hình ảnh' })
	images: string[];

	@ApiProperty({ description: 'Video URL', required: false })
	video?: string;

	@ApiProperty({ description: 'ID sự kiện liên quan', required: false })
	eventId?: Types.ObjectId;

	@ApiProperty({ description: 'ID nhóm liên quan', required: false })
	groupId?: Types.ObjectId;

	@ApiProperty({ type: [Types.ObjectId], description: 'Danh sách ID người dùng đã like' })
	likes: Types.ObjectId[];

	@ApiProperty({ type: [String], description: 'Danh sách hashtags' })
	hashtags: string[];

	@ApiProperty({ type: [Types.ObjectId], description: 'Danh sách ID người dùng được tag' })
	taggedUsers: Types.ObjectId[];

	@ApiProperty({ description: 'ID bài đăng được share từ', required: false })
	sharedFrom?: Types.ObjectId;

	@ApiProperty({ description: 'Số lượng like' })
	likeCount: number;

	@ApiProperty({ description: 'Số lượng comment' })
	commentCount: number;

	@ApiProperty({ description: 'Số lượng share' })
	shareCount: number;

	@ApiProperty({ enum: SportType, description: 'Môn thể thao liên quan' })
	sport: SportType;

	@ApiProperty({ enum: PostStatus, description: 'Trạng thái duyệt bài' })
	approvalStatus: PostStatus;

	@ApiProperty({ description: 'ID admin đã duyệt', required: false })
	approvedBy?: Types.ObjectId;

	@ApiProperty({ description: 'Thời gian duyệt', required: false })
	approvedAt?: Date;

	@ApiProperty({ description: 'Lý do từ chối', required: false })
	rejectionReason?: string;

	@ApiProperty({ description: 'ID admin đã từ chối', required: false })
	rejectedBy?: Types.ObjectId;

	@ApiProperty({ description: 'Thời gian từ chối', required: false })
	rejectedAt?: Date;

	@ApiProperty({ description: 'Thời gian tạo' })
	createdAt: Date;

	@ApiProperty({ description: 'Thời gian cập nhật' })
	updatedAt: Date;

	@ApiProperty({ enum: PostAccessLevel, description: 'Quyền truy cập bài đăng', required: false })
	accessLevel?: PostAccessLevel;

	// Virtual fields
	@ApiProperty({ description: 'Thông tin tác giả', required: false })
	authorUser?: any;

	@ApiProperty({ description: 'Thông tin sự kiện', required: false })
	event?: any;

	@ApiProperty({ description: 'Thông tin nhóm', required: false })
	group?: any;

	@ApiProperty({ description: 'Thông tin bài đăng được share từ', required: false })
	sharedFromPost?: any;

	@ApiProperty({ description: 'Danh sách comment', required: false })
	comments?: any[];
}

export class PaginatedPostsResponseDto {
	@ApiProperty({ type: [PostResponseDto], description: 'Danh sách bài đăng' })
	posts: PostResponseDto[];

	@ApiProperty({ description: 'Tổng số bài đăng' })
	total: number;

	@ApiProperty({ description: 'Trang hiện tại' })
	page: number;

	@ApiProperty({ description: 'Số lượng bài đăng trên mỗi trang' })
	limit: number;

	@ApiProperty({ description: 'Tổng số trang' })
	totalPages: number;

	@ApiProperty({ description: 'Có trang tiếp theo không' })
	hasNextPage: boolean;

	@ApiProperty({ description: 'Có trang trước không' })
	hasPrevPage: boolean;
}

export class CreatePostDto {
	@ApiProperty({
		description: 'Nội dung bài đăng',
		minLength: 1,
		maxLength: 2000,
		example: 'Hôm nay tôi đã có một buổi tập tuyệt vời! #fitness #health',
	})
	@IsString()
	@MinLength(1, { message: 'Nội dung không được để trống' })
	@MaxLength(2000, { message: 'Nội dung không được vượt quá 2000 ký tự' })
	content: string;

	@ApiProperty({
		enum: PostType,
		description: 'Loại bài đăng',
		default: PostType.TEXT,
		example: [PostType.TEXT, PostType.IMAGE, PostType.VIDEO, PostType.EVENT],
	})
	@IsEnum(PostType)
	type: PostType = PostType.TEXT;

	@ApiProperty({
		enum: SportType,
		description: 'Môn thể thao liên quan',
		example: SportType.FOOTBALL,
	})
	@IsEnum(SportType)
	sport: SportType;

	@ApiProperty({
		enum: PostStatus,
		description: 'Trạng thái duyệt bài',
		example: PostStatus.APPROVED,
	})
	@IsEnum(PostStatus)
	approvalStatus: PostStatus = PostStatus.APPROVED;

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
}

export class HashtagTrendingDto {
	@ApiProperty({ description: 'Tên hashtag' })
	hashtag: string;

	@ApiProperty({ description: 'Số lượng bài đăng sử dụng hashtag này' })
	postCount: number;

	@ApiProperty({ description: 'Tổng số lượt sử dụng hashtag này' })
	usageCount: number;
}

export class TrendingHashtagsResponseDto {
	@ApiProperty({ type: [HashtagTrendingDto], description: 'Danh sách hashtag trending' })
	hashtags: HashtagTrendingDto[];

	@ApiProperty({ description: 'Tổng số hashtag' })
	total: number;

	@ApiProperty({ description: 'Trang hiện tại' })
	page: number;

	@ApiProperty({ description: 'Số lượng hashtag trên mỗi trang' })
	limit: number;

	@ApiProperty({ description: 'Tổng số trang' })
	totalPages: number;

	@ApiProperty({ description: 'Có trang tiếp theo không' })
	hasNextPage: boolean;

	@ApiProperty({ description: 'Có trang trước không' })
	hasPrevPage: boolean;
}
