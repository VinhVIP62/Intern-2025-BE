import { Expose, Type } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, IsPositive } from 'class-validator';

export class GetReactionUsersDto {
	@Expose()
	@Type(() => Number)
	@IsInt()
	reactionValue!: number;

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
