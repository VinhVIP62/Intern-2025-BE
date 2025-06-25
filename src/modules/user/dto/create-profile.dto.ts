import { IsString, IsOptional, IsDateString, IsEnum, IsArray, IsUUID } from 'class-validator';
import { Sports } from '@common/enum/sports.enum';
import { SportLevel } from '@common/enum/sport-level.enum';

export class CreateProfileDto {
	@IsUUID()
	userId: string;

	@IsString()
	firstName: string;

	@IsString()
	lastName: string;

	@IsOptional()
	@IsString()
	bio?: string;

	@IsOptional()
	@IsString()
	avatarUrl?: string;

	@IsOptional()
	@IsString()
	coverUrl?: string;

	@IsDateString()
	birthday: Date;

	@IsString()
	gender: string;

	@IsOptional()
	@IsString()
	address?: string;

	@IsArray()
	@IsEnum(Sports, { each: true })
	sportInterests: Sports[];

	@IsArray()
	@IsEnum(SportLevel, { each: true })
	sportLevel: SportLevel[];
}
