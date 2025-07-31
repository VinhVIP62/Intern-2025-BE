import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	Req,
	UseInterceptors,
	Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SavedPostService } from '../providers/saved-post.service';
import { CreateSavedPostListDto } from '../dto/create-saved-post-list.dto';
import { Response } from '@common/decorators/response.decorator';
import { ResponseSavedPostListDto } from '../dto/response-saved-post-list.dto';
import { AddPostToSavedListDto } from '../dto/create-saved-post-items.dto';
import { ResponsePaging } from '@common/decorators/response-paging.decorator';
import { PaginatedPostResponseDto } from '../dto/paginated-posts-response.dto';
import { RemoveSavedPostDto } from '../dto/delete-saved-post.dto';
import { GetSavedPostsQueryDto } from '../dto/get-saved-post-items-query.dto';
import { PaginatedSavedPostListDto } from '../dto/paginated-saved-post-list.dto';

@ApiTags('SavedPost')
@Controller('saved-posts')
export class SavedPostController {
	constructor(private readonly savedPostService: SavedPostService) {}

	@Version('1')
	@Post()
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.saved-post.create.success')
	@ApiOperation({ summary: 'Tạo danh sách lưu bài viết mới' })
	@ApiResponse({ status: 201, type: ResponseSavedPostListDto })
	async createSavedList(
		@Req() req: Request,
		@Body() dto: CreateSavedPostListDto,
	): Promise<ResponseSavedPostListDto> {
		const userId = req.user!.id;
		return this.savedPostService.createSavedPostList(userId, dto.name);
	}

	@Version('1')
	@Get()
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.savedPost.list.success')
	@ApiOperation({ summary: 'Lấy danh sách các saved post list của người dùng' })
	@ApiResponse({ status: 200, type: PaginatedSavedPostListDto })
	async getSavedPostLists(
		@Req() req: Request,
		@Query() query: GetSavedPostsQueryDto,
	): Promise<{
		items: ResponseSavedPostListDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const userId = req.user!.id;
		const page = parseInt(query.page || '1');
		const limit = parseInt(query.limit || '10');
		return this.savedPostService.getSavedPostLists(userId, page, limit);
	}

	@Version('1')
	@Post(':id/add')
	@ApiBearerAuth()
	@UseInterceptors()
	@Response('response.savedPost.add.success')
	@ApiOperation({ summary: 'Thêm các bài viết vào danh sách lưu cụ thể' })
	@ApiParam({ name: 'id', description: 'ID của SavedPostList', type: String })
	@ApiResponse({ status: 200, description: 'Thêm thành công' })
	async addPostsToSavedList(
		@Param('id') savedListId: string,
		@Body() dto: AddPostToSavedListDto,
		@Req() req: Request,
	) {
		const userId = req.user!.id;
		await this.savedPostService.addPostsToSavedList(userId, savedListId, dto.postIds);
	}

	@Version('1')
	@Get(':id/posts')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiOperation({ summary: 'Lấy danh sách bài viết trong danh sách đã lưu' })
	@ApiParam({ name: 'id', description: 'ID danh sách đã lưu', type: String })
	@ResponsePaging('response.saved-post.posts.success')
	@ApiResponse({ status: 200, type: [PaginatedPostResponseDto] })
	async getSavedPosts(
		@Param('id') listId: string,
		@Req() req: Request,
		@Query() query: GetSavedPostsQueryDto,
	): Promise<any> {
		const userId = req.user!.id;
		const page = parseInt(query.page || '1');
		const limit = parseInt(query.limit || '10');
		return this.savedPostService.getSavedPosts(userId, listId, page, limit);
	}

	@Version('1')
	@Post(':id/remove')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiParam({ name: 'id', description: 'ID danh sách đã lưu', type: String })
	@Response('response.saved-post.remove.success')
	@ApiOperation({ summary: 'Gỡ bài viết khỏi danh sách đã lưu' })
	@ApiResponse({ status: 200, description: 'Gỡ bài viết khỏi danh sách thành công' })
	async removeSavedPost(
		@Param('id') listId: string,
		@Req() req: Request,
		@Body() dto: RemoveSavedPostDto,
	): Promise<void> {
		const userId = req.user!.id;
		await this.savedPostService.removeSavedPost(userId, listId, dto.postId);
	}

	@Version('1')
	@Delete(':id')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiParam({ name: 'id', description: 'ID danh sách đã lưu', type: String })
	@Response('response.saved-post-list.delete.success')
	@ApiOperation({ summary: 'Xoá một danh sách đã lưu của người dùng' })
	@ApiResponse({ status: 200, description: 'Xoá thành công' })
	async deleteSavedPostList(@Param('id') listId: string, @Req() req: Request): Promise<void> {
		const userId = req.user!.id;
		await this.savedPostService.deleteSavedPostList(userId, listId);
	}
}
