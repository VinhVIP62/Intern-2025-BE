import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class RemoveSavedPostDto {
	@ApiProperty({ description: 'ID bài viết cần gỡ khỏi danh sách', example: '60d...' })
	@IsMongoId()
	postId: string;
}
