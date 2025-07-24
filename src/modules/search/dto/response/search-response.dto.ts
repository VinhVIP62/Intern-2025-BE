import { ApiProperty, ApiQuery } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { SportType, ActivityLevel } from '@modules/user/enums/user.enum';
import { BasePaginationMetaDto } from '@common/dto/base-pagination.dto';
import { SearchFilterType } from '@modules/search/dto/request/search-request.dto';

export class SearchResultDto {
	@ApiProperty({ description: 'Loại kết quả', enum: SearchFilterType })
	type: SearchFilterType;

	@ApiProperty({ description: 'Kết quả', type: [Object] })
	results: any[];

	@ApiProperty({ description: 'Tổng số kết quả' })
	total: number;
}

export class PaginatedSearchResultDto extends BasePaginationMetaDto {
	@ApiProperty({ type: [SearchResultDto], description: 'Danh sách kết quả theo loại' })
	data: SearchResultDto[];
}
