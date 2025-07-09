import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	Version,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';

import { WithPopulated } from '@common/crud/entities';
import { ResponseTransform } from '@common/decorators';
import { AuthenticatedRequest, CursorPaginatedData } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import { CreatePostDto, FeedPostDto, ResponsePostDto, UpdatePostDto } from '../dto';
import { PostService } from '../providers';

@Controller()
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Version('1')
	@Post()
	@FormDataRequest({ storage: MemoryStoredFile })
	async createPost(
		@Req() request: AuthenticatedRequest,
		@Body() body: CreatePostDto,
	): Promise<WithPopulated<ResponsePostDto>> {
		const createdPost = await this.postService.createPost({ ...body, userId: request.user.id });
		return plainToInstanceStrict(ResponsePostDto, createdPost);
	}

	@Version('1')
	@Delete(':postid')
	async deletePost(
		@Param('postid', ParseObjectIdPipe) id: string,
		@Req() request: AuthenticatedRequest,
	): Promise<WithPopulated<ResponsePostDto>> {
		const deletedPost = await this.postService.deletePost(id, request.user.id);
		return plainToInstanceStrict(ResponsePostDto, deletedPost);
	}

	@Version('1')
	@Patch(':postid')
	@FormDataRequest({ storage: MemoryStoredFile })
	async updatePost(
		@Param('postid', ParseObjectIdPipe) id: string,
		@Req() request: AuthenticatedRequest,
		@Body() body: UpdatePostDto,
	): Promise<WithPopulated<ResponsePostDto>> {
		const updatedPost = await this.postService.updatePost(id, request.user.id, {
			...body,
			userId: request.user.id,
		});
		return plainToInstanceStrict(ResponsePostDto, updatedPost);
	}

	@Version('1')
	@Get('feed')
	@ResponseTransform({ pagination: true })
	async getFeed(
		@Req() request: AuthenticatedRequest,
		@Query() query: FeedPostDto,
	): Promise<CursorPaginatedData<WithPopulated<ResponsePostDto>>> {
		const feedPosts = await this.postService.getFeeds(request.user.id, query);
		return new CursorPaginatedData(
			feedPosts.nextCursor,
			plainToInstanceStrict(ResponsePostDto, feedPosts.foundPosts),
		);
	}

	@Version('1')
	@Get(':postid')
	async getPost(
		@Param('postid', ParseObjectIdPipe) id: string,
		@Req() request: AuthenticatedRequest,
	): Promise<WithPopulated<ResponsePostDto>> {
		const foundPost = await this.postService.getPost(id, request.user.id);
		return plainToInstanceStrict(ResponsePostDto, foundPost);
	}

	// async getPosts();
}
