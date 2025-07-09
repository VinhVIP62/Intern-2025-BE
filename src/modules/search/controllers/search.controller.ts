import {
	Controller,
	Get,
	Query,
	UseInterceptors,
	Version,
	ClassSerializerInterceptor,
	Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchService } from '../providers/search.service';
import { Public } from '@common/decorators';
import { Response } from '@common/decorators/response.decorator';
import { SearchQueryDto } from '../dto/search-query.dto';
import { Request } from 'express';

@ApiTags('Search')
@Controller('search')
export class SearchController {
	constructor(private readonly searchService: SearchService) {}

	@Version('1')
	@Public()
	@Get('')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.search.all.success')
	@ApiOperation({ summary: 'Tìm kiếm bài viết, người dùng theo từ khoá' })
	@ApiResponse({ status: 200 })
	async searchPosts(@Query() query: SearchQueryDto, @Req() req: Request) {
		const userId = req.user?.id ?? null;
		return this.searchService.searchAll(userId, query.keyword);
	}

	@Version('1')
	@Public()
	@Get('users')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.search.users.success')
	@ApiOperation({ summary: 'Tìm kiếm người dùng theo từ khoá' })
	@ApiResponse({ status: 200 })
	async searchUsers(@Query() query: SearchQueryDto, @Req() req: Request) {
		const userId = req.user?.id ?? null;
		return this.searchService.searchUsers(userId, query.keyword);
	}
}
