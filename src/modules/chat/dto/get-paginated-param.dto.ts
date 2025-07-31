import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetPaginatedParamDto {
	@ApiPropertyOptional({ description: 'Trang hiện tại', example: '1' })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({ description: 'Số lượng mỗi trang', example: '10' })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number;
}
