import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsString,
	IsOptional,
	IsBoolean,
	IsEnum,
	IsArray,
	ValidateNested,
	IsNumber,
	Min,
	Max,
	MaxLength,
	MinLength,
	IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SportType, ActivityLevel } from '@modules/user/enums/user.enum';

export class JoinConditionLocationDto {
	@ApiPropertyOptional({ description: 'City name', example: 'Ho Chi Minh City' })
	@IsOptional()
	@IsString()
	city?: string;

	@ApiPropertyOptional({ description: 'District name', example: 'District 1' })
	@IsOptional()
	@IsString()
	district?: string;

	@ApiPropertyOptional({ description: 'Address', example: '123 Main St' })
	@IsOptional()
	@IsString()
	address?: string;
}

export class JoinConditionAgeDto {
	@ApiPropertyOptional({ description: 'Minimum age', example: 18 })
	@IsOptional()
	@IsNumber()
	min?: number;

	@ApiPropertyOptional({ description: 'Maximum age', example: 30 })
	@IsOptional()
	@IsNumber()
	max?: number;
}

export class JoinConditionSportDto {
	@ApiPropertyOptional({
		description: 'Sport conditions',
		example: { football: 'intermediate', tennis: 'beginner' },
		type: 'object',
		additionalProperties: { enum: Object.values(ActivityLevel) },
	})
	@IsOptional()
	@IsObject()
	sport?: Record<SportType, ActivityLevel>;
}

export class JoinConditionsDto {
	@ApiPropertyOptional({ type: JoinConditionSportDto })
	@IsOptional()
	@IsObject()
	sport?: Record<SportType, ActivityLevel>;

	@ApiPropertyOptional({ type: JoinConditionLocationDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => JoinConditionLocationDto)
	location?: JoinConditionLocationDto;

	@ApiPropertyOptional({ type: JoinConditionAgeDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => JoinConditionAgeDto)
	age?: JoinConditionAgeDto;
}

export class LocationDto {
	@ApiPropertyOptional({ description: 'City name', example: 'Ho Chi Minh City' })
	@IsOptional()
	@IsString()
	city?: string;

	@ApiPropertyOptional({ description: 'District name', example: 'District 1' })
	@IsOptional()
	@IsString()
	district?: string;

	@ApiPropertyOptional({ description: 'Address', example: '123 Main St' })
	@IsOptional()
	@IsString()
	address?: string;
}

export class CreateGroupDto {
	@ApiProperty({ description: 'Group name', example: 'Fitness Enthusiasts' })
	@IsString()
	@MinLength(1)
	@MaxLength(100)
	name: string;

	@ApiPropertyOptional({ description: 'Group description', example: 'A group for fitness lovers' })
	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;

	@ApiPropertyOptional({
		description: 'Group avatar URL',
		example: 'https://example.com/avatar.jpg',
	})
	@IsOptional()
	@IsString()
	avatar?: string;

	@ApiPropertyOptional({
		description: 'Group cover image URL',
		example: 'https://example.com/cover.jpg',
	})
	@IsOptional()
	@IsString()
	coverImage?: string;

	@ApiProperty({ description: 'Sport type', enum: SportType, example: SportType.FOOTBALL })
	@IsEnum(SportType)
	sport: SportType;

	@ApiPropertyOptional({ description: 'Group location' })
	@IsOptional()
	@ValidateNested()
	@Type(() => LocationDto)
	location?: LocationDto;

	@ApiPropertyOptional({ description: 'Is private group', example: false })
	@IsOptional()
	@IsBoolean()
	isPrivate?: boolean;

	@ApiPropertyOptional({ description: 'Require post approval', example: false })
	@IsOptional()
	@IsBoolean()
	requirePostApproval?: boolean;

	@ApiPropertyOptional({ description: 'Auto approve join group', example: true })
	@IsOptional()
	@IsBoolean()
	autoApproveJoinGroup?: boolean;

	@ApiPropertyOptional({
		description: 'Join conditions for group (sport, location, age)',
		type: JoinConditionsDto,
		example: {
			sport: {
				football: 'beginner',
				tennis: 'beginner',
				badminton: 'beginner',
			},
			location: {
				city: 'Hồ Chí Minh',
				district: 'Quận 7',
				address: '123 Main St',
			},
			age: {
				min: 10,
				max: 60,
			},
		},
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => JoinConditionsDto)
	joinConditions?: JoinConditionsDto;
}

export class UpdateGroupDto {
	@ApiPropertyOptional({ description: 'Group name', example: 'Fitness Enthusiasts' })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	@MinLength(1)
	name?: string;

	@ApiPropertyOptional({ description: 'Group description', example: 'A group for fitness lovers' })
	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;

	@ApiPropertyOptional({
		description: 'Group avatar URL',
		example: 'https://example.com/avatar.jpg',
	})
	@IsOptional()
	@IsString()
	avatar?: string;

	@ApiPropertyOptional({
		description: 'Group cover image URL',
		example: 'https://example.com/cover.jpg',
	})
	@IsOptional()
	@IsString()
	coverImage?: string;

	@ApiPropertyOptional({ description: 'Sport type', enum: SportType, example: SportType.FOOTBALL })
	@IsOptional()
	@IsEnum(SportType)
	sport?: SportType;

	@ApiPropertyOptional({ description: 'Group location' })
	@IsOptional()
	@ValidateNested()
	@Type(() => LocationDto)
	location?: LocationDto;

	@ApiPropertyOptional({ description: 'Is private group', example: false })
	@IsOptional()
	@IsBoolean()
	isPrivate?: boolean;

	@ApiPropertyOptional({ description: 'Require post approval', example: false })
	@IsOptional()
	@IsBoolean()
	requirePostApproval?: boolean;

	@ApiPropertyOptional({ description: 'Auto approve join group', example: true })
	@IsOptional()
	@IsBoolean()
	autoApproveJoinGroup?: boolean;

	@ApiPropertyOptional({
		description: 'Join conditions for group (sport, location, age)',
		type: JoinConditionsDto,
		example: {
			sport: {
				football: 'beginner',
				tennis: 'beginner',
				badminton: 'beginner',
			},
			location: {
				city: 'Hồ Chí Minh',
				district: 'Quận 7',
				address: '123 Main St',
			},
			age: {
				min: 10,
				max: 60,
			},
		},
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => JoinConditionsDto)
	joinConditions?: JoinConditionsDto;
}
