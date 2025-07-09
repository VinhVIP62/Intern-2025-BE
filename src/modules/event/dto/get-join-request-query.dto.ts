import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetJoinRequestsQueryDto {
	@ApiPropertyOptional({ enum: ['pending', 'accepted', 'rejected', 'cancelled'] })
	@IsOptional()
	@IsIn(['pending', 'accepted', 'rejected', 'cancelled'])
	status?: 'pending' | 'accepted' | 'rejected' | 'cancelled';

	@ApiPropertyOptional({ example: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page: number = 1;

	@ApiPropertyOptional({ example: 10, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit: number = 10;
}
