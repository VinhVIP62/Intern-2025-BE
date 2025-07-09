import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from '../providers/search.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards';
import { TypeQuery } from '../types/type-query.dto';

@Controller()
export class SearchController {
	constructor(private readonly searchService: SearchService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiQuery({ name: 'keyword', type: String, required: true })
	@ApiQuery({ name: 'type', type: String, required: false })
	async search(@Query('keyword') query: string, @Query('type') type: TypeQuery) {
		const result = await this.searchService.searchEngine(query, type);
		return {
			success: true,
			message: 'Search successful',
			data: result,
		};
	}
}
