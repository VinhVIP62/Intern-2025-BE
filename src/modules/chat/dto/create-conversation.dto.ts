import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsBoolean } from 'class-validator';

export class CreateConversationDto {
	@ApiProperty({
		description: 'Danh sách ID người bạn cần tạo cuộc trò chuyện cùng',
		type: [String],
	})
	@IsArray()
	@IsMongoId({ each: true })
	friendIds: string[];

	@ApiProperty({
		description: 'Loại hội thoại: true nếu là nhóm, false nếu là trò chuyện 1-1',
		example: false,
		type: Boolean,
	})
	@IsBoolean()
	isGroup: boolean;
}
