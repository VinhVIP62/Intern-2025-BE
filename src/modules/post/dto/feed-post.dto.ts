import { Expose } from 'class-transformer';
import { IsMongoId, IsOptional, IsPositive } from 'class-validator';

export class FeedPostDto {
	@Expose()
	@IsMongoId()
	@IsOptional()
	cursor?: string;

	@Expose()
	@IsOptional()
	@IsPositive()
	limit: number = 10;
}
