import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PaginationQueryDto {
	@ApiProperty({ description: 'Trang', required: false, default: 1 })
	@IsOptional()
	@Type(() => Number)
	page?: number = 1;

	@ApiProperty({ description: 'Số lượng trên mỗi trang', required: false, default: 10 })
	@IsOptional()
	@Type(() => Number)
	limit?: number = 10;
}
