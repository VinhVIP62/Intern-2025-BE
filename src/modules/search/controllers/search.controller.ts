import { Controller, Get, Post, Query, Version, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Public } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { ResponseEntity } from '@common/types';
import {
	SearchAllQueryDto,
	SearchQueryDto,
	PaginatedSearchResultDto,
	SearchFilterType,
} from '../dto/search.dto';
import { SearchService } from '../providers/search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
	constructor(private readonly searchService: SearchService) {}

	@Version('1')
	@Get('all')
	@Public()
	@ApiOperation({ summary: 'Tìm kiếm tất cả các loại (user, post, event, ...)' })
	@ApiQuery({ name: 'key', required: false, description: 'Từ khóa tìm kiếm' })
	@ApiQuery({ name: 'page', required: false, type: Number, description: 'Trang', example: 1 })
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Số lượng trên mỗi trang',
		example: 10,
	})
	@ApiQuery({
		name: 'timeRange',
		required: false,
		type: String,
		description: 'Khoảng thời gian (7d, 30d, 90d, all)',
		example: '7d',
	})
	@ApiResponse({ status: 200, description: 'Kết quả tìm kiếm', type: PaginatedSearchResultDto })
	async searchAll(
		@Query() query: SearchAllQueryDto,
		@I18n() i18n: I18nContext,
		@Request() req,
	): Promise<ResponseEntity<PaginatedSearchResultDto>> {
		const result = await this.searchService.searchAll(query, req.user?.id, i18n);
		return {
			success: true,
			data: result,
			message: i18n.t('search.SEARCH_ALL_SUCCESS'),
		};
	}

	@Version('1')
	@Post()
	@Public()
	@ApiOperation({ summary: 'Tìm kiếm theo loại (user, post, event, ...)' })
	@ApiBody({ type: SearchQueryDto, description: 'Body chứa các tham số tìm kiếm' })
	@ApiResponse({ status: 200, description: 'Kết quả tìm kiếm', type: PaginatedSearchResultDto })
	async search(
		@Body() body: SearchQueryDto,
		@I18n() i18n: I18nContext,
		@Request() req,
	): Promise<ResponseEntity<PaginatedSearchResultDto>> {
		const result = await this.searchService.search(body, req.user?.id, i18n);
		return {
			success: true,
			data: result,
			message: i18n.t('search.SEARCH_SUCCESS'),
		};
	}
}
