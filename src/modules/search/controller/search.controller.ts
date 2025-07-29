import { Get, Query, Req } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { Public } from '@common/decorators';
import { Version } from '@nestjs/common';
import { SearchService } from '../search.service';
import { ResponseEntity } from '@common/types';
import { Response } from '@common/decorators/response.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

@Controller({
	version: '1',
})
export class SearchController {
	constructor(private readonly searchService: SearchService) {}

	@Get('all')
	@Version('1')
	async searchAll(
		@Req() request: Request,
		@Query('keyword') keyword: string,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const result = await this.searchService.searchAll(user.id, keyword);
		return {
			success: true,
			data: result,
		};
	}

	@Get('profile/reindex')
	@Version('1')
	@Public()
	async reindexProfile() {
		try {
			await this.searchService.deleteIndex('profile');
		} catch (e) {}
		await this.searchService.createIndexProfileWithVietnameseSupport();
		return this.searchService.reindexProfiles();
	}

	@Get('profiles')
	@Version('1')
	@ApiOperation({ summary: 'Tìm kiếm hồ sơ người dùng' })
	@Response()
	async searchProfiles(
		@Query('keyword') keyword: string,
		@Query('page') page: number = 1,
	): Promise<ResponseEntity<any>> {
		const result = await this.searchService.searchProfile(keyword, page);
		return {
			success: true,
			data: result,
		};
	}

	@Get('posts')
	@Version('1')
	@Response()
	async searchPosts(
		@Req() request: Request,
		@Query('keyword') keyword: string,
		@Query('page') page: number = 1,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.searchService.searchPost(user.id, keyword, page);
		return {
			success: true,
			data: res,
		};
	}

	@Get('posts/reindex')
	@Version('1')
	@Public()
	async reindexPosts() {
		try {
			await this.searchService.deleteIndex('post');
		} catch (e) {}

		await this.searchService.createIndexPostWithVietnameseSupport();
		return this.searchService.reindexPosts();
	}

	@Get('events')
	@Version('1')
	@Response()
	async searchEvents(
		@Req() request: Request,
		@Query('keyword') keyword: string,
		@Query('page') page: number = 1,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.searchService.searchEvent(user.id, keyword, page);
		return {
			success: true,
			data: res,
		};
	}

	@Get('events/reindex')
	@Version('1')
	@Public()
	async reindexEvents() {
		try {
			await this.searchService.deleteIndex('event');
		} catch (e) {}
		await this.searchService.createIndexEventWithVietnameseSupport();
		return this.searchService.reindexEvents();
	}
}
