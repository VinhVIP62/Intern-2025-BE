import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { IsString, IsOptional, IsMongoId, MinLength, MaxLength, IsBoolean } from 'class-validator';

export class CommentResponseDto {
	@ApiProperty({ description: 'ID của comment' })
	_id: string;

	@ApiProperty({ description: 'ID của bài đăng' })
	postId: Types.ObjectId;

	@ApiProperty({ description: 'ID của tác giả' })
	author: Types.ObjectId;

	@ApiProperty({ description: 'Nội dung comment' })
	content: string;

	@ApiProperty({ description: 'ID comment cha (cho reply)', required: false })
	parentId?: Types.ObjectId;

	@ApiProperty({ type: [Types.ObjectId], description: 'Danh sách ID người dùng đã like' })
	likes: Types.ObjectId[];

	@ApiProperty({ description: 'Trạng thái hoạt động' })
	isActive: boolean;

	@ApiProperty({ description: 'Trạng thái ẩn' })
	isHidden: boolean;

	@ApiProperty({ description: 'Số lượng like' })
	likeCount: number;

	@ApiProperty({ description: 'Số lượng reply' })
	replyCount: number;

	@ApiProperty({ description: 'Thời gian tạo' })
	createdAt: Date;

	@ApiProperty({ description: 'Thời gian cập nhật' })
	updatedAt: Date;

	// Virtual fields
	@ApiProperty({
		description: 'Thông tin tác giả',
		required: false,
		example: {
			_id: '685a2443342f516009019c71',
			firstName: 'John',
			lastName: 'Doe',
			avatar: 'https://example.com/avatar.jpg',
			fullName: 'John Doe',
		},
	})
	authorUser?: {
		_id: string;
		firstName: string;
		lastName: string;
		avatar: string;
		fullName: string;
	};

	@ApiProperty({
		description: 'Thông tin bài đăng',
		required: false,
		example: {
			_id: '6864972223c53bb8ca77e453',
			content: 'bạn bè của 123 và tôi đã có một buổi tập tuyệt vời! #fitness #health',
		},
	})
	post?: {
		_id: string;
		content: string;
	};

	@ApiProperty({
		description: 'Thông tin comment cha',
		required: false,
		example: {
			_id: '507f1f77bcf86cd799439011',
			content: 'Comment cha',
			author: '507f1f77bcf86cd799439013',
		},
	})
	parentComment?: {
		_id: string;
		content: string;
		author: Types.ObjectId;
	};

	@ApiProperty({
		description: 'Danh sách reply',
		required: false,
		type: [CommentResponseDto],
	})
	replies?: CommentResponseDto[];
}

export class PaginatedCommentsResponseDto {
	@ApiProperty({ type: [CommentResponseDto], description: 'Danh sách comment' })
	comments: CommentResponseDto[];

	@ApiProperty({ description: 'Tổng số comment' })
	total: number;

	@ApiProperty({ description: 'Trang hiện tại' })
	page: number;

	@ApiProperty({ description: 'Số lượng comment trên mỗi trang' })
	limit: number;

	@ApiProperty({ description: 'Tổng số trang' })
	totalPages: number;

	@ApiProperty({ description: 'Có trang tiếp theo không' })
	hasNextPage: boolean;

	@ApiProperty({ description: 'Có trang trước không' })
	hasPrevPage: boolean;
}

export class CreateCommentDto {
	@ApiProperty({
		description: 'Nội dung comment',
		minLength: 1,
		maxLength: 1000,
		example: 'Bài viết rất hay! Cảm ơn bạn đã chia sẻ.',
	})
	@IsString()
	@MinLength(1, { message: 'Nội dung không được để trống' })
	@MaxLength(1000, { message: 'Nội dung không được vượt quá 1000 ký tự' })
	content: string;

	@ApiProperty({
		description: 'ID comment cha (cho reply)',
		required: false,
		example: '507f1f77bcf86cd799439011',
	})
	@IsOptional()
	@IsMongoId()
	parentId?: string;
}

export class UpdateCommentDto {
	@ApiProperty({
		description: 'Nội dung comment',
		minLength: 1,
		maxLength: 1000,
		required: false,
		example: 'Cập nhật nội dung comment!',
	})
	@IsOptional()
	@IsString()
	@MinLength(1, { message: 'Nội dung không được để trống' })
	@MaxLength(1000, { message: 'Nội dung không được vượt quá 1000 ký tự' })
	content?: string;
}

export class CreateReplyDto {
	@ApiProperty({
		description: 'Nội dung reply',
		minLength: 1,
		maxLength: 1000,
		example: 'Tôi đồng ý với bạn!',
	})
	@IsString()
	@MinLength(1, { message: 'Nội dung không được để trống' })
	@MaxLength(1000, { message: 'Nội dung không được vượt quá 1000 ký tự' })
	content: string;
}

export class UpdateCommentVisibilityDto {
	@ApiProperty({
		description: 'Trạng thái ẩn/hiện comment',
		example: true,
	})
	@IsBoolean()
	isHidden: boolean;
}
