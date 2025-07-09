import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
