import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { IsOptional, IsString, IsMongoId, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateSearchHistoryDto {
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
	@IsMongoId()
	user?: string;

	@ApiProperty({ type: String, required: false, description: 'Group ID được tìm kiếm' })
	@IsOptional()
	@IsMongoId()
	group?: string;

	@ApiProperty({ type: String, required: false, description: 'Event ID được tìm kiếm' })
	@IsOptional()
	@IsMongoId()
	event?: string;
}

// Internal DTO for repository operations
export class CreateSearchHistoryInternalDto {
	@IsOptional()
	@IsString()
	text?: string;

	@IsOptional()
	@IsString()
	hashtag?: string;

	@IsOptional()
	user?: Types.ObjectId;

	@IsOptional()
	group?: Types.ObjectId;

	@IsOptional()
	event?: Types.ObjectId;
}
