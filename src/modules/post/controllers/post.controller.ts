import {
	Controller,
	HttpStatus,
	ParseFilePipeBuilder,
	Req,
	UseInterceptors,
	BadRequestException,
	Body,
	Param,
	Query,
	UploadedFiles,
} from '@nestjs/common';
import { PostService } from '../providers/post.service';
import { UploadService } from '@modules/upload/providers/upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Post, Get, UseGuards, Delete, Put } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards';
import { CreatePostDto } from '../dto/request/create-post.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { PostQueryDto } from '../dto/request/post-query.dto';
import { UpdatePostDto } from '../dto/request/update-post.dto';
import { Response } from '@common/decorators/response.decorator';
import { PaginationQuery } from '@common/decorators/paginationQuery.decorator';
import { FileType } from '@common/types/file.type';

@Controller()
export class PostController {
	constructor(
		private readonly postService: PostService,
		private readonly uploadService: UploadService,
	) {}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'Post created successfully' })
	@ApiOperation({ summary: 'Create a post' })
	@Post()
	@Response()
	@UseInterceptors(FilesInterceptor('images'))
	async createPost(
		@Req() req: Request,
		@Body() dto: CreatePostDto,
		@UploadedFiles(
			new ParseFilePipeBuilder()
				// .addFileTypeValidator({
				// 	fileType: '.*',
				// })
				.addMaxSizeValidator({
					maxSize: 1024 * 1024 * 50,
				})
				.build({
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
					fileIsRequired: false,
				}),
		)
		files?: Express.Multer.File[],
	) {
		const userId = (req.user as any).id;

		if (!files || files.length === 0) {
			if (!dto.content) {
				throw new BadRequestException('Content is required');
			}
			return await this.postService.createPost({
				...dto,
				userId,
			});
		}

		const images = files ? await this.uploadService.uploadMultipleFiles(files, 'posts') : [];

		return await this.postService.createPost({
			...dto,
			userId,
			images,
		});
	}
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
	@ApiQuery({ name: 'limit', required: false, description: 'Number of posts per page' })
	@ApiQuery({ name: 'sort', required: false, description: 'Sort order (asc or desc)' })
	@ApiResponse({ status: 200, description: 'Posts fetched successfully' })
	@ApiOperation({ summary: 'Get my posts' })
	@Response()
	@Get('my-posts')
	async getMyPosts(@Query() query: PostQueryDto, @Req() req: Request) {
		const userId = (req.user as any).id;
		return await this.postService.getMyPosts(userId, query);
	}
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'Post fetched successfully' })
	@ApiOperation({ summary: 'Get a post by id' })
	@Response()
	@Get(':id')
	async getPostById(@Param('id') id: string, @Req() req: Request) {
		const userId = (req.user as any).id;
		return await this.postService.getPostById(id, userId);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'Posts fetched successfully' })
	@ApiOperation({ summary: 'Get all posts' })
	@Response()
	@Get()
	@ApiOperation({ summary: 'Get all posts by with optional filters and pagination' })
	@ApiQuery({ name: 'userId', required: false, description: 'Filter posts by user ID' })
	@ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
	@ApiQuery({ name: 'limit', required: false, description: 'Number of posts per page' })
	@ApiQuery({ name: 'sort', required: false, description: 'Sort order (asc or desc)' })
	async getPostWithPagination(@Query() query: PostQueryDto, @Req() req: Request) {
		const userId = (req.user as any).id;
		return await this.postService.getPostWithPagination(query, userId);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'Post deleted successfully' })
	@ApiOperation({ summary: 'Delete a post' })
	@Response()
	@Delete(':id')
	async deletePost(@Param('id') id: string, @Req() req: Request) {
		const userId = (req.user as any).id;
		return await this.postService.deletePost(userId, id);
	}
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'Post updated successfully' })
	@ApiOperation({ summary: 'Update a post' })
	@Response()
	@UseInterceptors(FilesInterceptor('files'))
	@Put(':id')
	async updatePost(
		@Param('id') id: string,
		@Body() dto: UpdatePostDto,
		@Req() req: Request,
		@UploadedFiles(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({
					fileType: 'jpeg|png|jpg|webp|bmp|heic|mp4|mov|avi|mkv|webm|video/x-matroska|video/mp4',
				})
				.addMaxSizeValidator({
					maxSize: 1024 * 1024 * 50,
				})
				.build({
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
					fileIsRequired: false,
				}),
		)
		files?: Express.Multer.File[],
	) {
		const userId = (req.user as any).id;
		const images = files ? await this.uploadService.uploadMultipleFiles(files, 'posts') : [];
		return await this.postService.updatePost(userId, id, { ...dto, images });
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'Comment created successfully' })
	@ApiOperation({ summary: 'Reply to a comment' })
	@Response()
	@ApiBearerAuth()
	@Post(':id/reply-comment')
	async replyComment(
		@Param('id') id: string,
		@Body() dto: { content: string; parentCommentId: string },
		@Req() req: Request,
	) {
		const userId = (req.user as any).id;
		return await this.postService.commentPost(
			{
				...dto,
				postId: id,
				userId,
				isOriginal: false,
			},
			dto.parentCommentId,
			userId,
		);
	}
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'Comment created successfully' })
	@ApiOperation({ summary: 'Comment on a post' })
	@Response()
	@Post(':id/comment')
	async commentPost(
		@Param('id') id: string,
		@Body() dto: { content: string },
		@Req() req: Request,
	) {
		const userId = (req.user as any).id;
		return await this.postService.commentPost(
			{
				content: dto.content,
				postId: id,
				userId,
				isOriginal: true,
			},
			null,
			userId,
		);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get comments of a post' })
	@ApiResponse({ status: 200, description: 'Comments fetched successfully' })
	@Response()
	@Get(':id/comments')
	async getComments(
		@Param('id') id: string,
		@Req() req: Request,
		@PaginationQuery() paginationQuery: { page: number; limit: number },
	) {
		const userId = (req.user as any).id;
		return await this.postService.getCommentsByPostId(
			id,
			userId,
			paginationQuery.page,
			paginationQuery.limit,
		);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get more comments of a post' })
	@ApiResponse({ status: 200, description: 'More comments fetched successfully' })
	@Response()
	@Get(':id/comments/:rootCommentId')
	async getMoreComments(
		@Param('id') id: string,
		@Param('rootCommentId') rootCommentId: string,
		@PaginationQuery() paginationQuery: { page: number; limit: number },
		@Req() req: Request,
	) {
		const userId = (req.user as any).id;
		return await this.postService.getMoreCommentsByRootCommentId(
			id,
			rootCommentId,
			paginationQuery.page,
			paginationQuery.limit,
			userId,
		);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete a comment' })
	@ApiResponse({ status: 200, description: 'Comment deleted successfully' })
	@Response()
	@Delete(':id/comments/:commentId')
	async deleteComment(
		@Param('id') id: string,
		@Param('commentId') commentId: string,
		@Req() req: Request,
	) {
		const userId = (req.user as any).id;
		return await this.postService.deleteComment(userId, id, commentId);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Like a post' })
	@ApiResponse({ status: 200, description: 'Post liked successfully' })
	@Response()
	@Post(':id/like')
	async likePost(@Param('id') id: string, @Req() req: Request) {
		const userId = (req.user as any).id;
		return await this.postService.likePost(userId, id);
	}
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Unlike a post' })
	@ApiResponse({ status: 200, description: 'Post unliked successfully' })
	@Response()
	@Delete(':id/like')
	async unlikePost(@Param('id') id: string, @Req() req: Request) {
		const userId = (req.user as any).id;
		return await this.postService.unlikePost(userId, id);
	}
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all posts by with optional filters and pagination' })
	@ApiResponse({ status: 200, description: 'Posts fetched successfully' })
	@Response()
	@Post(':id/comments/:commentId/like')
	async likeComment(
		@Param('id') id: string,
		@Param('commentId') commentId: string,
		@Req() req: Request,
	) {
		const userId = (req.user as any).id;
		return await this.postService.likeComment(userId, id, commentId);
	}
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Unlike a comment' })
	@ApiResponse({ status: 200, description: 'Comment unliked successfully' })
	@Response()
	@Delete(':id/comments/:commentId/unlike')
	async unlikeComment(
		@Param('id') id: string,
		@Param('commentId') commentId: string,
		@Req() req: Request,
	) {
		const userId = (req.user as any).id;
		return await this.postService.unlikeComment(userId, id, commentId);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all posts by with optional filters and pagination' })
	@ApiResponse({ status: 200, description: 'Posts fetched successfully' })
	@Response()
	@Get(':id/likes')
	async getUserLikedPosts(
		@Param('id') id: string,
		@PaginationQuery() paginationQuery: { page: number; limit: number },
	) {
		return await this.postService.getUserLikedPosts(
			id,
			paginationQuery.page,
			paginationQuery.limit,
		);
	}
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Share a post' })
	@ApiResponse({ status: 200, description: 'Post shared successfully' })
	@Response()
	@Post(':id/share')
	async sharePost(@Param('id') id: string, @Body() dto: CreatePostDto, @Req() req: Request) {
		const userId = (req.user as any).id;
		return await this.postService.sharePost(id, { ...dto, userId });
	}
}
