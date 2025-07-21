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
import { PriorityRole, ResponseTransform } from '@common/decorators';
import { Role } from '@common/enums';
import { UnionValidationPipe } from '@common/pipes';
import { AuthenticatedRequest, CursorPaginatedData } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import {
	CreateFilePostDto,
	FeedPostDto,
	ResponsePostDto,
	UpdateEventPostDto,
	UpdateFilePostDto,
	UpdateSharePostDto,
} from '../dto';
import { PostType } from '../enums';
import { PostService } from '../providers';

@PriorityRole(Role.USER)
@Controller()
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Version('1')
	@Post()
	@FormDataRequest({ storage: MemoryStoredFile })
	async createPost(
		@Req() request: AuthenticatedRequest,
		@Body() body: CreateFilePostDto,
	): Promise<WithPopulated<ResponsePostDto>> {
		const createdPost = await this.postService.createPost({ ...body, userId: request.user.id });
		return plainToInstanceStrict(ResponsePostDto, createdPost);
	}

	@Version('1')
	@Delete(':postid')
	async deletePost(
		@Param('postid', ParseObjectIdPipe) postId: string,
	): Promise<WithPopulated<ResponsePostDto>> {
		const deletedPost = await this.postService.deletePost(postId);
		return plainToInstanceStrict(ResponsePostDto, deletedPost);
	}

	@Version('1')
	@Patch(':postid')
	@FormDataRequest({ storage: MemoryStoredFile })
	async updatePost(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Body(
			new UnionValidationPipe<UpdateEventPostDto | UpdateFilePostDto | UpdateSharePostDto>({
				discriminator: 'postType',
				types: {
					[PostType.EVENT]: UpdateEventPostDto,
					[PostType.FILES]: UpdateFilePostDto,
					[PostType.SHARED]: UpdateSharePostDto,
				},
			}),
		)
		body: UpdateEventPostDto | UpdateFilePostDto | UpdateSharePostDto,
	): Promise<WithPopulated<ResponsePostDto>> {
		const updatedPost = await this.postService.updatePost(postId, body.postType, body);
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
		@Param('postid', ParseObjectIdPipe) postId: string,
	): Promise<WithPopulated<ResponsePostDto>> {
		const foundPost = await this.postService.getPost(postId);
		return plainToInstanceStrict(ResponsePostDto, foundPost);
	}
}
