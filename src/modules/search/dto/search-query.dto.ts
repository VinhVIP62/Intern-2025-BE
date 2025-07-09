import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchQueryDto {
	@ApiProperty({ example: 'Ngày mới', description: 'Từ khóa tìm kiếm' })
	@IsString()
	keyword: string;

	// @ApiPropertyOptional({ example: '1', description: 'Trang hiện tại' })
	// @IsOptional()
	// @IsNumberString()
	// page?: string;

	// @ApiPropertyOptional({ example: '10', description: 'Số bài viết mỗi trang' })
	// @IsOptional()
	// @IsNumberString()
	// limit?: string;
}
