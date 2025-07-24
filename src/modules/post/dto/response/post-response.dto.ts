import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { PostType, PostStatus, PostAccessLevel } from '@modules/post/entities/post.enum';
import { SportType } from '@modules/user/enums/user.enum';
import { BasePaginationMetaDto } from '@common/dto/base-pagination.dto';

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

	@ApiProperty({ description: 'Danh sách thông tin người dùng được tag', required: false })
	taggedUsersList?: any[];
}

export class PaginatedPostsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({ type: [PostResponseDto], description: 'Danh sách bài đăng' })
	posts: PostResponseDto[];
}

export class HashtagTrendingDto {
	@ApiProperty({ description: 'Tên hashtag' })
	hashtag: string;

	@ApiProperty({ description: 'Số lượng bài đăng sử dụng hashtag này' })
	postCount: number;

	@ApiProperty({ description: 'Tổng số lượt sử dụng hashtag này' })
	usageCount: number;
}

export class TrendingHashtagsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({ type: [HashtagTrendingDto], description: 'Danh sách hashtag trending' })
	hashtags: HashtagTrendingDto[];
}
