import { IsOptional, IsMongoId, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetPostsQueryDto {
	@ApiPropertyOptional({ example: '1', description: 'Trang hiện tại' })
	@IsOptional()
	@IsNumberString()
	page?: string;

	@ApiPropertyOptional({ example: '10', description: 'Số bài viết mỗi trang' })
	@IsOptional()
	@IsNumberString()
	limit?: string;

	@ApiPropertyOptional({ example: '64dabc...', description: 'Lọc theo ID người dùng' })
	@IsOptional()
	@IsMongoId({ message: 'ID không hợp lệ' })
	userId?: string;
}
