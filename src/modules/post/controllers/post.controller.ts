import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Version } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';

import { WithPopulated } from '@common/crud/entities';
import { AuthenticatedRequest } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import { CreatePostDto, ResponsePostDto, UpdatePostDto } from '../dto';
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
	@Delete(':id')
	async deletePost(
		@Param('id', ParseObjectIdPipe) id: string,
		@Req() request: AuthenticatedRequest,
	): Promise<WithPopulated<ResponsePostDto>> {
		const deletedPost = await this.postService.deletePost(id, request.user.id);
		return plainToInstanceStrict(ResponsePostDto, deletedPost);
	}

	@Version('1')
	@Patch(':id')
	@FormDataRequest({ storage: MemoryStoredFile })
	async updatePost(
		@Param('id', ParseObjectIdPipe) id: string,
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
	@Get(':id')
	async getPost(
		@Param('id', ParseObjectIdPipe) id: string,
		@Req() request: AuthenticatedRequest,
	): Promise<WithPopulated<ResponsePostDto>> {
		const foundPost = await this.postService.getPost(id, request.user.id);
		return plainToInstanceStrict(ResponsePostDto, foundPost);
	}

	// async getFeed();
	// async getPosts();
}
