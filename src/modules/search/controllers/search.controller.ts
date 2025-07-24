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
} from '@modules/search/dto';
import { SearchService } from '@modules/search/providers/search.service';
import { ISearchHistoryRepository } from '@modules/search/repositories/searchHistory.repository';
import {
	CreateSearchHistoryDto,
	CreateSearchHistoryInternalDto,
	SearchHistoryResultDto,
	PaginatedEnhancedSearchHistoryResultDto,
	EnhancedSearchHistoryResultDto,
} from '@modules/search/dto';
import { Inject } from '@nestjs/common';
import { Types } from 'mongoose';

@ApiTags('Search')
@Controller('search')
export class SearchController {
	constructor(
		private readonly searchService: SearchService,
		@Inject(ISearchHistoryRepository)
		private readonly searchHistoryRepository: ISearchHistoryRepository,
	) {}

	@Version('1')
	@Get('all')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
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
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
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

	@Version('1')
	@Get('history')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy lịch sử tìm kiếm' })
	@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
	@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
	@ApiResponse({ status: 200, type: PaginatedEnhancedSearchHistoryResultDto })
	async getSearchHistory(
		@Query('page') page = 1,
		@Query('limit') limit = 10,
		@Request() req,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<PaginatedEnhancedSearchHistoryResultDto>> {
		const userId = req.user?.id;
		let data: EnhancedSearchHistoryResultDto[] = [];
		let total = 0;
		if (userId) {
			const result = await this.searchService.getSearchHistoryWithBasicData(userId, page, limit);
			data = result.data;
			total = result.total;
		}
		const totalPages = Math.ceil(total / limit);
		return {
			success: true,
			data: {
				data,
				page,
				limit,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			},
			message: i18n.t('search.FETCH_HISTORY_SUCCESS'),
		};
	}

	@Version('1')
	@Post('history')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Thêm lịch sử tìm kiếm' })
	@ApiBody({ type: CreateSearchHistoryDto })
	@ApiResponse({ status: 201, type: SearchHistoryResultDto })
	async createSearchHistory(
		@Body() body: CreateSearchHistoryDto,
		@Request() req,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		const userId = req.user?.id;
		// Convert string IDs to ObjectIds if they exist
		const searchHistoryData: CreateSearchHistoryInternalDto = {
			text: body.text,
			hashtag: body.hashtag,
			user: body.user ? new Types.ObjectId(body.user) : undefined,
			group: body.group ? new Types.ObjectId(body.group) : undefined,
			event: body.event ? new Types.ObjectId(body.event) : undefined,
		};

		await this.searchHistoryRepository.create(
			new Types.ObjectId(String(userId)),
			searchHistoryData,
		);
		return {
			success: true,
			message: i18n.t('search.CREATE_HISTORY_SUCCESS'),
		};
	}
}
