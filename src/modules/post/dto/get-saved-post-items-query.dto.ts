import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class GetSavedPostsQueryDto {
	@ApiPropertyOptional({ example: '1', description: 'Trang hiện tại' })
	@IsOptional()
	@IsNumberString()
	page?: string;

	@ApiPropertyOptional({ example: '10', description: 'Số bài viết mỗi trang' })
	@IsOptional()
	@IsNumberString()
	limit?: string;
}
