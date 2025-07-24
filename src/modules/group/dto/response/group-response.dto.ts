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
import { BasePaginatedResponseDto } from '@common/dto/base-pagination.dto';
import { BasePaginationMetaDto } from '@common/dto/base-pagination.dto';
import { LocationDto } from '@modules/user/dto/update-profile.dto';
import { JoinConditionsDto } from '../request/group-request.dto';

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

	@ApiPropertyOptional({
		description: 'Group cover image URL',
		example: 'https://example.com/cover.jpg',
	})
	coverImage?: string;
}

export class PaginatedGroupsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({ description: 'Groups data', type: [GroupResponseDto] })
	data: GroupResponseDto[];
}

export class PaginatedSimpleGroupsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({ description: 'Groups data', type: [SimpleGroupResponseDto] })
	data: SimpleGroupResponseDto[];
}
