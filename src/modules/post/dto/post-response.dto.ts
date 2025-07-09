import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PostResponseDto {
	@ApiProperty({ description: 'ID của người dùng' })
	@Expose()
	userId: string;

	@ApiProperty({ description: 'ID của bài viết' })
	@Expose()
	postId: string;

	@ApiProperty({ description: 'Nội dung của bài viết' })
	@Expose()
	content: string | null;

	@ApiProperty({ description: 'Ảnh của bài viết' })
	@Expose()
	images: string[];

	@ApiProperty({ description: 'Ngày tạo bài viết' })
	@Expose()
	createdAt: Date;

	@ApiProperty({ description: 'Tiêu đề của bài viết' })
	@Expose()
	title: string | null;

	@ApiProperty({ description: 'Số lượng bình luận' })
	@Expose()
	commentCount: number;

	@ApiProperty({ description: 'Số lượng người thích' })
	@Expose()
	likedUserCount: number;

	@ApiProperty({ description: 'ID của người thích' })
	@Expose()
	likedUserIds: string[];

	@ApiProperty({ description: 'Số lượng chia sẻ' })
	@Expose()
	shareCount: number;

	@ApiProperty({ description: 'Quyền riêng tư của bài viết' })
	@Expose()
	privacy: string;

	@ApiProperty({ description: 'Bài viết có được thích không' })
	@Expose()
	isLiked: boolean;
}
