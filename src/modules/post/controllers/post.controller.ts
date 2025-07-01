import { Controller, Get, Param, Query, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PostService } from '../providers/post.service';
import { ResponseEntity } from '@common/types';
import { PostResponseDto, PaginatedPostsResponseDto } from '../dto/post.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SportType } from '@modules/user/enums/user.enum';
import { Public } from '@common/decorators';
@ApiTags('Post')
@Controller('posts')
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Version('1')
	@Public()
	@Get()
	@ApiOperation({ summary: 'Lấy danh sách bài đăng (newsfeed)' })
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Số trang (mặc định: 1)',
		example: 1,
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Số lượng bài đăng trên mỗi trang (mặc định: 10)',
		example: 10,
	})
	@ApiQuery({
		name: 'sport',
		required: false,
		enum: Object.values(SportType),
		description: 'Lọc theo môn thể thao',
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách bài đăng thành công',
		type: PaginatedPostsResponseDto,
	})
	async getNewsfeed(
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('sport') sport?: string,
	): Promise<ResponseEntity<PaginatedPostsResponseDto>> {
		const result = await this.postService.getNewsfeed(i18n, page, limit, sport);

		return {
			success: true,
			data: result,
			message: i18n.t('post.NEWSFEED_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Get(':postId')
	@ApiOperation({ summary: 'Lấy thông tin chi tiết bài đăng theo ID' })
	@ApiParam({
		name: 'postId',
		description: 'ID của bài đăng',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy thông tin bài đăng thành công',
		type: PostResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy bài đăng',
	})
	async getPostById(
		@Param('postId') postId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<PostResponseDto>> {
		const post = await this.postService.getPostById(postId, i18n);

		return {
			success: true,
			data: post,
			message: i18n.t('post.POST_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Get('user/:userId')
	@ApiOperation({ summary: 'Lấy danh sách bài đăng của người dùng theo ID' })
	@ApiParam({
		name: 'userId',
		description: 'ID của người dùng',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Số trang (mặc định: 1)',
		example: 1,
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Số lượng bài đăng trên mỗi trang (mặc định: 10)',
		example: 10,
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách bài đăng của người dùng thành công',
		type: PaginatedPostsResponseDto,
	})
	async getPostsByUserId(
		@Param('userId') userId: string,
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	): Promise<ResponseEntity<PaginatedPostsResponseDto>> {
		const result = await this.postService.getPostsByUserId(userId, i18n, page, limit);

		return {
			success: true,
			data: result,
			message: i18n.t('post.USER_POSTS_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Get('all')
	@ApiOperation({ summary: 'Lấy tất cả bài đăng' })
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Số trang (mặc định: 1)',
		example: 1,
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Số lượng bài đăng trên mỗi trang (mặc định: 10)',
		example: 10,
	})
	@ApiQuery({
		name: 'sport',
		required: false,
		enum: Object.values(SportType),
		description: 'Lọc theo môn thể thao',
	})
	@ApiQuery({
		name: 'userId',
		required: false,
		type: String,
		description: 'Lọc theo ID người dùng',
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy tất cả bài đăng thành công',
		type: PaginatedPostsResponseDto,
	})
	async getAllPosts(
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('sport') sport?: string,
		@Query('userId') userId?: string,
	): Promise<ResponseEntity<PaginatedPostsResponseDto>> {
		const result = await this.postService.getAllPosts(i18n, page, limit, sport, userId);

		return {
			success: true,
			data: result,
			message: i18n.t('post.ALL_POSTS_RETRIEVED_SUCCESS'),
		};
	}
}
