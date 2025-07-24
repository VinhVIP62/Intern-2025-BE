import { ApiProperty, ApiQuery } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { SportType, ActivityLevel } from '@modules/user/enums/user.enum';

export enum SearchFilterType {
	USER = 'user',
	POST = 'post',
	EVENT = 'event',
	GROUP = 'group',
	HASHTAGS = 'hashtags',
	LOCATION = 'location',
}

export class SearchAllQueryDto {
	@ApiProperty({ description: 'Từ khóa tìm kiếm', required: false })
	@IsOptional()
	@IsString()
	key?: string;

	@ApiProperty({ description: 'Trang', required: false, default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	page?: number = 1;

	@ApiProperty({ description: 'Số lượng trên mỗi trang', required: false, default: 10 })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	limit?: number = 10;

	@ApiProperty({ description: 'Khoảng thời gian (7d, 30d, 90d, all)', required: false })
	@IsOptional()
	@IsString()
	timeRange?: string;
}

export class SearchQueryDto {
	@ApiProperty({ description: 'Từ khóa tìm kiếm', required: false })
	@IsOptional()
	@IsString()
	key?: string;

	@ApiProperty({
		enum: SearchFilterType,
		description: 'Danh sách filter',
		required: true,
		isArray: true,
	})
	@IsEnum(SearchFilterType, { each: true })
	filter: SearchFilterType[];

	@ApiProperty({ enum: SportType, description: 'Môn thể thao', required: false })
	@IsOptional()
	@IsEnum(SportType)
	sportType?: SportType;

	@ApiProperty({ enum: ActivityLevel, description: 'Trình độ', required: false })
	@IsOptional()
	@IsEnum(ActivityLevel)
	level?: ActivityLevel;

	@ApiProperty({ description: 'Trang', required: false, default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	page?: number = 1;

	@ApiProperty({ description: 'Số lượng trên mỗi trang', required: false, default: 10 })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	limit?: number = 10;

	@ApiProperty({ description: 'Khoảng thời gian (7d, 30d, 90d, all)', required: false })
	@IsOptional()
	@IsString()
	timeRange?: string;
}
