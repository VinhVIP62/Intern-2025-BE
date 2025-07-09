import { Expose, Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class FeedPostDto {
	@Expose()
	@IsMongoId()
	@IsOptional()
	cursor?: string;

	@Expose()
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	@IsPositive()
	limit: number = 10;
}
