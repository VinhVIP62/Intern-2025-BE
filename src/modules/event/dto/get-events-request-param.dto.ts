import { IsOptional, IsMongoId, IsInt, Min, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetEventsRequestParamDto {
	@ApiPropertyOptional({ description: 'ID môn thể thao', example: '60ff1c0c...' })
	@IsOptional()
	@IsMongoId()
	sportId?: string;

	@ApiPropertyOptional({ description: 'ID người tạo sự kiện' })
	@IsOptional()
	@IsMongoId()
	creatorId?: string;

	@ApiPropertyOptional({ description: 'Có yêu cầu phê duyệt hay không', example: 'true' })
	@IsOptional()
	@Transform(({ value }) => value === 'true')
	@IsBoolean()
	requiresApproval?: boolean;

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
