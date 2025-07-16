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
} from 'class-validator';
import { Type } from 'class-transformer';
import { SportType } from '@modules/user/enums/user.enum';

export class LocationDto {
	@ApiPropertyOptional({ description: 'City name', example: 'Ho Chi Minh City' })
	@IsOptional()
	@IsString()
	city?: string;

	@ApiPropertyOptional({ description: 'District name', example: 'District 1' })
	@IsOptional()
	@IsString()
	district?: string;
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
}

export class GroupResponseDto {
	@ApiProperty({ description: 'Group ID', example: '507f1f77bcf86cd799439011' })
	_id: string;

	@ApiProperty({ description: 'Group name', example: 'Fitness Enthusiasts' })
	name: string;

	@ApiPropertyOptional({ description: 'Group description', example: 'A group for fitness lovers' })
	description?: string;

	@ApiPropertyOptional({
		description: 'Group avatar URL',
		example: 'https://example.com/avatar.jpg',
	})
	avatar?: string;

	@ApiPropertyOptional({
		description: 'Group cover image URL',
		example: 'https://example.com/cover.jpg',
	})
	coverImage?: string;

	@ApiProperty({ description: 'Admin user IDs', type: [String] })
	admins: string[];

	@ApiProperty({ description: 'Member user IDs', type: [String] })
	members: string[];

	@ApiProperty({ description: 'Waiting list user IDs', type: [String] })
	waitingList: string[];

	@ApiProperty({ description: 'Invite list user IDs', type: [String] })
	inviteList: string[];

	@ApiProperty({ description: 'Sport type', enum: SportType, example: SportType.FOOTBALL })
	sport: SportType;

	@ApiPropertyOptional({ description: 'Group location' })
	location?: LocationDto;

	@ApiProperty({ description: 'Is private group', example: false })
	isPrivate: boolean;

	@ApiProperty({ description: 'Member count', example: 50 })
	memberCount: number;

	@ApiProperty({ description: 'Require post approval', example: false })
	requirePostApproval: boolean;

	@ApiProperty({ description: 'Auto approve join group', example: true })
	autoApproveJoinGroup: boolean;

	@ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00.000Z' })
	createdAt: Date;

	@ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00.000Z' })
	updatedAt: Date;
}

export class SimpleGroupResponseDto {
	@ApiProperty({ description: 'Group ID', example: '507f1f77bcf86cd799439011' })
	_id: string;

	@ApiProperty({ description: 'Group name', example: 'Fitness Enthusiasts' })
	name: string;

	@ApiPropertyOptional({ description: 'Group description', example: 'A group for fitness lovers' })
	description?: string;

	@ApiPropertyOptional({
		description: 'Group avatar URL',
		example: 'https://example.com/avatar.jpg',
	})
	avatar?: string;

	@ApiPropertyOptional({
		description: 'Latest post time in this group',
		example: '2024-01-01T00:00:00.000Z',
	})
	latestPostTime?: Date;

	@ApiProperty({
		description: 'Role of the user in this group',
		example: 'admin',
		enum: ['admin', 'member'],
	})
	role: 'admin' | 'member';
}

export class PaginatedGroupsResponseDto {
	@ApiProperty({ description: 'Total number of groups', example: 100 })
	total: number;

	@ApiProperty({ description: 'Current page', example: 1 })
	page: number;

	@ApiProperty({ description: 'Items per page', example: 10 })
	limit: number;

	@ApiProperty({ description: 'Total pages', example: 10 })
	totalPages: number;

	@ApiProperty({ description: 'Groups data', type: [GroupResponseDto] })
	data: GroupResponseDto[];
}

export class PaginatedSimpleGroupsResponseDto {
	@ApiProperty({ description: 'Total number of groups', example: 100 })
	total: number;

	@ApiProperty({ description: 'Current page', example: 1 })
	page: number;

	@ApiProperty({ description: 'Items per page', example: 10 })
	limit: number;

	@ApiProperty({ description: 'Total pages', example: 10 })
	totalPages: number;

	@ApiProperty({ description: 'Groups data', type: [SimpleGroupResponseDto] })
	data: SimpleGroupResponseDto[];
}
