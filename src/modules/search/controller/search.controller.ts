import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { SearchService } from '@modules/search/providers/search.service';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards';
import { TypeQuery } from '@modules/search/enum/type-query.enum';
import { Request } from 'express';
import { Response } from '@common/decorators/response.decorator';

@Controller()
export class SearchController {
	constructor(private readonly searchService: SearchService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Search for users, posts, and comments' })
	// @ResponsePaging() need time to config more
	@Response()
	@ApiQuery({ name: 'keyword', type: String, required: true })
	@ApiQuery({ name: 'type', enum: TypeQuery, required: false })
	async search(
		@Query('keyword') query: string,
		@Query('type') type: TypeQuery,
		@Req() req: Request,
	) {
		const userId = (req.user as any).id;
		const result = await this.searchService.searchEngine(query, type, userId);
		return {
			success: true,
			message: 'Search successful',
			data: result,
		};
	}
}
