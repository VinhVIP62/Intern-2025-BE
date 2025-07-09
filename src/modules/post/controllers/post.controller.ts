import {
	Controller,
	Get,
	UseInterceptors,
	Version,
	ClassSerializerInterceptor,
	Post,
	Req,
	Body,
	Param,
	Patch,
	Delete,
	Query,
} from '@nestjs/common';
import { PostService } from '../providers/post.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from '@common/decorators/response.decorator';
import { PostResponseDto } from '../dto/response-posts.dto';
import { CreatePostDto } from '../dto/create-post.dto';
import { Types } from 'mongoose';
import { Request } from 'express';
import { Public } from '@common/decorators';
import { GetPostParamDto } from '../dto/get-post-detail.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { DeletePostParamDto } from '../dto/delete-post-param.dto';
import { UpdatePostParamDto } from '../dto/update-post-param.dto';
import { GetPostsQueryDto } from '../dto/get-posts-query.dto';
import { ResponsePaging } from '@common/decorators/response-paging.decorator';
import { PaginatedPostResponseDto } from '../dto/paginated-posts-response.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Version('1')
	@Get()
	@Public()
	@ApiBearerAuth()
	@ResponsePaging('response.post.list.success')
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiOperation({
		summary: 'Lấy newsfeed',
		description:
			'Lấy các bài viết public nếu chưa đăng nhập, hoặc thêm bài viết của bạn bè nếu đã đăng nhập. (phân trang, lọc)',
	})
	@ApiResponse({ status: 200, description: 'Danh sách bài viết', type: [PaginatedPostResponseDto] })
	async getPosts(@Req() req: Request, @Query() query: GetPostsQueryDto): Promise<any> {
		const ownerId = req.user?.id ?? null;
		return this.postService.getPostsWithFilter(ownerId, query);
	}

	@Version('1')
	@Get(':id')
	@Public()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiBearerAuth()
	@Response('response.post.detail.success')
	@ApiOperation({ summary: 'Lấy chi tiết bài viết' })
	@ApiParam({ name: 'id', description: 'ID bài viết', type: String })
	@ApiResponse({ status: 200, type: PostResponseDto })
	async getPostById(
		@Req() req: Request,
		@Param() params: GetPostParamDto,
	): Promise<PostResponseDto> {
		const userId = req.user?.id ?? null;
		return this.postService.getPostById(params.id, userId);
	}

	@Version('1')
	@Post()
	@ApiBearerAuth()
	@Response('response.post.create.success')
	@ApiOperation({ summary: 'Tạo bài viết mới' })
	@ApiResponse({ status: 201, type: PostResponseDto })
	async create(@Req() req: Request, @Body() dto: CreatePostDto): Promise<PostResponseDto> {
		const userId = new Types.ObjectId(req.user?.id);
		return await this.postService.createPost(userId, dto);
	}

	@Version('1')
	@Patch(':id')
	@ApiBearerAuth()
	@Response('response.post.update.success')
	@ApiOperation({ summary: 'Cập nhật bài viết (chỉ tác giả)' })
	@ApiParam({ name: 'id', description: 'ID bài viết', type: String })
	@ApiResponse({ status: 200, type: PostResponseDto })
	async updatePost(
		@Param() params: UpdatePostParamDto,
		@Body() dto: UpdatePostDto,
		@Req() req: Request,
	): Promise<PostResponseDto> {
		const userId = req.user!.id;
		return this.postService.updatePost(params.id, userId, dto);
	}

	@Version('1')
	@Delete(':id')
	@ApiBearerAuth()
	@Response('response.post.delete.success')
	@ApiOperation({ summary: 'Xoá bài viết' })
	@ApiResponse({ status: 200, description: 'Xoá bài viết thành công' })
	async deletePost(@Param() params: DeletePostParamDto, @Req() req: Request): Promise<void> {
		await this.postService.deletePost(params.id, req.user!.id);
	}
}
