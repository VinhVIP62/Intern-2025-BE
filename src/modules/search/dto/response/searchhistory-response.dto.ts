import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { IsOptional, IsString, IsMongoId, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { BasePaginatedResponseDto } from '@common/dto/base-pagination.dto';
import { BasePaginationMetaDto } from '@common/dto/base-pagination.dto';

export class BasicInfoDto {
	@ApiProperty({ type: String, description: 'Entity ID' })
	@IsString()
	id: string;

	@ApiProperty({ type: String, description: 'Entity name/title' })
	@IsString()
	name: string;

	@ApiProperty({ type: String, required: false, description: 'Entity avatar/image' })
	@IsOptional()
	@IsString()
	avatar?: string;
}

export class EnhancedSearchHistoryResultDto {
	@ApiProperty({ type: String })
	userId: string;

	@ApiProperty({ type: String, required: false, description: 'Text hoặc hashtag mà user nhập' })
	@IsOptional()
	@IsString()
	text?: string;

	@ApiProperty({ type: String, required: false, description: 'Hashtag mà user nhập' })
	@IsOptional()
	@IsString()
	hashtag?: string;

	@ApiProperty({ type: BasicInfoDto, required: false, description: 'Basic user information' })
	@IsOptional()
	user?: BasicInfoDto;

	@ApiProperty({ type: BasicInfoDto, required: false, description: 'Basic group information' })
	@IsOptional()
	group?: BasicInfoDto;

	@ApiProperty({ type: BasicInfoDto, required: false, description: 'Basic event information' })
	@IsOptional()
	event?: BasicInfoDto;

	@ApiProperty({ type: String, description: 'Thời gian tạo' })
	@IsString()
	createdAt: string;
}

export class PaginatedEnhancedSearchHistoryResultDto extends BasePaginationMetaDto {
	@ApiProperty({ type: [EnhancedSearchHistoryResultDto] })
	data: EnhancedSearchHistoryResultDto[];
}

export class SearchHistoryResultDto {
	@ApiProperty({ type: String })
	userId: string;

	@ApiProperty({ type: String, required: false, description: 'Text hoặc hashtag mà user nhập' })
	@IsOptional()
	@IsString()
	text?: string;

	@ApiProperty({ type: String, required: false, description: 'Hashtag mà user nhập' })
	@IsOptional()
	@IsString()
	hashtag?: string;

	@ApiProperty({ type: String, required: false, description: 'User ID được tìm kiếm' })
	@IsOptional()
	@IsString()
	user?: string;

	@ApiProperty({ type: String, required: false, description: 'Group ID được tìm kiếm' })
	@IsOptional()
	@IsString()
	group?: string;

	@ApiProperty({ type: String, required: false, description: 'Event ID được tìm kiếm' })
	@IsOptional()
	@IsString()
	event?: string;

	@ApiProperty({ type: String, description: 'Thời gian tạo' })
	@IsString()
	createdAt: string;
}
