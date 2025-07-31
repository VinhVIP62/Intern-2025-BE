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
	@Get('all')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.search.all.success')
	@ApiOperation({ summary: 'Tìm kiếm bài viết, sự kiện, người dùng theo từ khoá' })
	@ApiResponse({ status: 200 })
	async searchAll(@Query() query: SearchQueryDto, @Req() req: Request) {
		const userId = req.user?.id ?? null;
		return this.searchService.searchAll(userId, query.keyword);
	}

	@Version('1')
	@Public()
	@Get('posts')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.search.posts.success')
	@ApiOperation({ summary: 'Tìm kiếm bài viết theo từ khoá' })
	@ApiResponse({ status: 200 })
	async searchPosts(@Query() query: SearchQueryDto, @Req() req: Request) {
		const userId = req.user?.id ?? null;
		return this.searchService.searchPosts(userId, query.keyword);
	}

	@Version('1')
	@Public()
	@Get('events')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.search.events.success')
	@ApiOperation({ summary: 'Tìm kiếm sự kiện theo từ khoá' })
	@ApiResponse({ status: 200 })
	async searchEvents(@Query() query: SearchQueryDto, @Req() req: Request) {
		const userId = req.user?.id ?? null;
		return this.searchService.searchEvents(userId, query.keyword);
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

	@Version('1')
	@Public()
	@Get('friends')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.search.users.success')
	@ApiOperation({ summary: 'Tìm kiếm người dùng theo từ khoá' })
	@ApiResponse({ status: 200 })
	async searchFriends(@Query() query: SearchQueryDto, @Req() req: Request) {
		const userId = req.user?.id ?? null;
		return this.searchService.searchFriends(userId, query.keyword);
	}

	@Version('1')
	@Public()
	@Get('posts/hashtag')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.search.posts.success')
	@ApiOperation({ summary: 'Tìm kiếm bài viết theo hashtag' })
	@ApiResponse({ status: 200 })
	async searchPostsByHashtag(@Query() query: SearchQueryDto, @Req() req: Request) {
		const userId = req.user?.id ?? null;
		return this.searchService.searchPostsByHashtag(userId, query.keyword);
	}

	@Version('1')
	@Public()
	@Get('events/hashtag')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.search.events.success')
	@ApiOperation({ summary: 'Tìm kiếm sự kiện theo hashtag' })
	@ApiResponse({ status: 200 })
	async searchEventsByHashtag(@Query() query: SearchQueryDto, @Req() req: Request) {
		const userId = req.user?.id ?? null;
		return this.searchService.searchEventsByHashtag(userId, query.keyword);
	}
}
