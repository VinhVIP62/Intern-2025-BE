import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, ArrayNotEmpty } from 'class-validator';

export class UpdateConversationMemberDto {
	@ApiProperty({
		description: 'Danh sách ID của thành viên cần thêm hoặc xoá',
		example: ['664b1d0fa1a98d5f6721aa01', '664b1d12a1a98d5f6721aa02'],
	})
	@IsArray()
	@ArrayNotEmpty()
	@IsMongoId({ each: true })
	memberIds: string[];
}
