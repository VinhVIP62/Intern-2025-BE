import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BasePostResponseDto {
	@ApiProperty({ description: 'ID của người dùng' })
	@Expose()
	userId: string;
	@ApiProperty({ description: 'Tên của người dùng' })
	@Expose()
	fullName: string;
	@ApiProperty({ description: 'Ảnh đại diện của người dùng' })
	@Expose()
	avatar: string;
	@ApiProperty({ description: 'ID của bài viết' })
	@Expose()
	postId: string;
	@ApiProperty({ description: 'Nội dung của bài viết' })
	@Expose()
	content: string | null;

	@ApiProperty({ description: 'Ảnh của bài viết' })
	@Expose()
	images: { url: string; publicId: string; type: string }[];

	@ApiProperty({ description: 'Ngày tạo bài viết' })
	@Expose()
	createdAt: Date;

	@ApiProperty({ description: 'Tiêu đề của bài viết' })
	@Expose()
	title: string | null;

	@ApiProperty({ description: 'Số lượng người thích' })
	@Expose()
	likeCount: number;

	@ApiProperty({ description: 'Số lượng chia sẻ' })
	@Expose()
	shareCount: number;

	@ApiProperty({ description: 'Quyền riêng tư của bài viết' })
	@Expose()
	privacy: string;
}
export class PostResponseDto extends BasePostResponseDto {
	@ApiProperty({ description: 'Bài viết có được thích không' })
	@Expose()
	isLiked: boolean;

	@ApiProperty({ description: 'ID của người thích' })
	@Expose()
	likedUserIds: string[];

	@ApiProperty({ description: 'Số lượng bình luận' })
	@Expose()
	commentCount: number;
}

export class PostSearchResponseDto {
	@ApiProperty({ description: 'Bài viết' })
	@Expose()
	postId: string;
	@ApiProperty({ description: 'ID của người dùng' })
	@Expose()
	userId: string;
	@ApiProperty({ description: 'Tên của người dùng' })
	@Expose()
	fullName: string;
	@ApiProperty({ description: 'Ảnh đại diện của người dùng' })
	@Expose()
	avatar: string;
	@ApiProperty({ description: 'Tiêu đề của bài viết' })
	@Expose()
	title: string;
	@ApiProperty({ description: 'Nội dung của bài viết' })
	@Expose()
	content: string;
	@ApiProperty({ description: 'Ảnh của bài viết' })
	@Expose()
	images: { url: string; publicId: string; type: string }[];

	@ApiProperty({ description: 'Quyền riêng tư của bài viết' })
	@Expose()
	privacy: string;
	@ApiProperty({ description: 'ID của bài viết gốc' })
	@Expose()
	originalPostId: string;
	@ApiProperty({ description: 'Quyền riêng tư của bài viết gốc' })
	@Expose()
	originalPrivacy: string;
	@ApiProperty({ description: 'ID của người dùng gốc' })
	@Expose()
	originalPostUserId: string;
	@ApiProperty({ description: 'Tên của người dùng gốc' })
	@Expose()
	originalPostFullName: string;
	@ApiProperty({ description: 'Ảnh đại diện của người dùng gốc' })
	@Expose()
	originalPostAvatar: string;
}
