import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId } from 'class-validator';

export class AddPostToSavedListDto {
	@ApiProperty({ type: [String], description: 'Danh sách postId cần thêm vào danh sách lưu' })
	@IsArray()
	@IsMongoId({ each: true })
	postIds: string[];
}
