import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Sports } from '@common/enum/sports.enum';
import { SportLevel } from '@common/enum/sport-level.enum';
import { AddressDto } from './address.dto';

export class UpdateProfileDto {
	@IsUUID()
	userId: string;

	@IsOptional()
	@IsString()
	firstName?: string;

	@IsOptional()
	@IsString()
	lastName?: string;

	@IsOptional()
	@IsString()
	nickname?: string;

	@IsOptional()
	@IsString()
	bio?: string;

	@IsOptional()
	@IsString()
	avatarUrl?: string;

	@IsOptional()
	@IsString()
	coverUrl?: string;

	@IsOptional()
	@IsDateString()
	birthday?: Date;

	@IsOptional()
	@IsString()
	gender?: string;

	@IsOptional()
	address?: AddressDto;

	@IsOptional()
	@IsArray()
	@IsEnum(Sports, { each: true })
	sportInterests?: Sports[];

	@IsOptional()
	@IsArray()
	@IsEnum(SportLevel, { each: true })
	sportLevel?: SportLevel[];
}
