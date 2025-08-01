import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PostQueryDto {
	@IsOptional()
	@IsString()
	userId?: string;

	@IsOptional()
	@Type(() => Number)
	@Min(1)
	@IsNumber()
	page?: number = 1;

	@IsOptional()
	@Type(() => Number)
	@Min(1)
	@Max(20)
	@IsNumber()
	limit?: number = 10;

	@IsOptional()
	@IsIn(['createdAt', 'content'])
	sortBy?: string = 'createdAt';

	@IsOptional()
	@IsIn(['asc', 'desc'])
	sortOrder?: string = 'desc';
}
