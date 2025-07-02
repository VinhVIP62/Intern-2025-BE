import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Param, Put, Query, Version } from '@nestjs/common/decorators';
import { PostService } from '../providers/post.service';
import { CreatePostDto } from '../dto/createPost.dto';
import { Response } from '@common/decorators/response.decorator';
import { ResponseEntity } from '@common/types';
import { Request } from 'express';
import { UpdatePostDto } from '../dto/updattePost.dto';

@ApiTags('Posts')
@Controller({
	version: '1',
})
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Get('newsfeed')
	@Version('1')
	@ApiOperation({ summary: 'Lấy newsfeed' })
	@Response()
	async getNewsfeed(
		@Req() req: Request,
		@Query('updatedBefore') updatedBefore: string,
	): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const newsfeed = await this.postService.getNewsfeed(user.id, updatedBefore);
		return {
			success: true,
			data: newsfeed,
		};
	}

	@Post()
	@Version('1')
	@ApiOperation({ summary: 'Tạo bài viết mới' })
	@ApiResponse({ status: 201, description: 'Tạo bài viết thành công' })
	@Response()
	async createPost(@Req() req: Request, @Body() dto: CreatePostDto): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const post = await this.postService.createPost(user.id, dto);
		return {
			success: true,
			data: post,
		};
	}

	@Put('/:postId')
	@Version('1')
	@ApiOperation({ summary: 'Chỉnh sửa bài viết' })
	@Response()
	async updatePost(
		@Req() req: Request,
		@Param('postId') postId: string,
		@Body() body: UpdatePostDto,
	): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const newpost = await this.postService.updatePost(user.id, postId, body);
		return {
			success: true,
			data: newpost,
		};
	}

	@Get()
	@Version('1')
	@ApiOperation({ summary: 'Lấy bài viết của tôi' })
	@ApiResponse({ status: 200, description: 'Danh sách bài viết của bạn' })
	@Response()
	async getMyPosts(@Req() req: Request): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const post = await this.postService.getUserPosts(user.id);
		return {
			success: true,
			data: post,
		};
	}
}
