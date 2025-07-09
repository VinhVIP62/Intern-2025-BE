import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNumberString, IsOptional } from 'class-validator';

export class GetCommentsQueryDto {
	@ApiPropertyOptional({
		description: 'ID của bình luận cha (nếu có)',
		example: 'd223g23...',
		type: String,
	})
	@IsOptional()
	@IsMongoId()
	parentCommentId?: string;

	@ApiPropertyOptional({ example: '1', description: 'Trang hiện tại' })
	@IsOptional()
	@IsNumberString()
	page?: string;

	@ApiPropertyOptional({ example: '10', description: 'Số bình luận mỗi trang' })
	@IsOptional()
	@IsNumberString()
	limit?: string;
}
