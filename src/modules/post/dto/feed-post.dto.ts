import { Expose, Type } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, IsPositive } from 'class-validator';

export class FeedPostDto {
	@Expose()
	@IsMongoId()
	@IsOptional()
	cursor?: string;

	@Expose()
	@Type(() => Number)
	@IsInt()
	@IsOptional()
	@IsPositive()
	limit: number = 10;
}
