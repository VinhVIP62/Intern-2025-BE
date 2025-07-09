import {
	Controller,
	UploadedFile,
	HttpStatus,
	ParseFilePipeBuilder,
	Req,
	UseInterceptors,
	BadRequestException,
	Body,
	NotFoundException,
	Param,
	Query,
	UploadedFiles,
	ForbiddenException,
} from '@nestjs/common';
import { PostService } from '../providers/post.service';
import { UploadService } from 'src/shared/upload/providers/upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Post, Get, UseGuards, Delete, Put } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards';
import { CreatePostDto } from '../dto/create-post.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { PostQueryDto } from '../dto/post-query.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Response } from 'src/common/decorators/response.decorator';

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
				.addFileTypeValidator({
					fileType: 'jpeg|png|jpg|webp|bmp|heic',
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

		if (!files || files.length === 0) {
			if (!dto.content) {
				throw new BadRequestException('Content is required');
			}
			return await this.postService.createPost({
				...dto,
				userId,
			});
		}

		const uploadedImages = await this.uploadService.uploadMultipleImages(files, 'posts');
		return await this.postService.createPost({
			...dto,
			userId,
			images: uploadedImages.map(image => image.url),
			imagesIds: uploadedImages.map(image => image.publicId),
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
	@Put(':id')
	async updatePost(@Param('id') id: string, @Body() dto: UpdatePostDto, @Req() req: Request) {
		const userId = (req.user as any).id;
		return await this.postService.updatePost(userId, id, dto);
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
		return await this.postService.commentPost({
			content: dto.content,
			postId: id,
			userId,
			isOriginal: true,
		});
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get comments of a post' })
	@ApiResponse({ status: 200, description: 'Comments fetched successfully' })
	@Response()
	@Get(':id/comments')
	async getComments(@Param('id') id: string) {
		return await this.postService.getCommentsByPostId(id);
	}
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get more comments of a post' })
	@ApiResponse({ status: 200, description: 'More comments fetched successfully' })
	@Response()
	@Get(':id/comments/:rootCommentId')
	async getMoreComments(@Param('id') id: string, @Param('rootCommentId') rootCommentId: string) {
		return await this.postService.getMoreCommentsByRootCommentId(id, rootCommentId);
	}
	// @UseGuards(JwtAuthGuard)
	// @ApiBearerAuth()
	// @Post(':id/comments/:rootCommentId/like')
	// async likeComment(@Param('id') id: string, @Param('rootCommentId') rootCommentId: string, @Req() req: Request) {
	// 	const userId = (req.user as any).id;
	// 	const comment = await this.postService.likeComment(userId, id, rootCommentId);
	// 	return {
	// 		success: true,
	// 		comment,
	// 	};
	// }

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
}
