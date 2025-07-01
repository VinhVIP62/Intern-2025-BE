import {
	Controller,
	Get,
	Param,
	Query,
	Version,
	Post,
	Body,
	Request,
	UseGuards,
	UseInterceptors,
	UploadedFiles,
	BadRequestException,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiQuery,
	ApiBody,
	ApiConsumes,
} from '@nestjs/swagger';
import { PostService } from '../providers/post.service';
import { ResponseEntity } from '@common/types';
import { PostResponseDto, PaginatedPostsResponseDto, CreatePostDto } from '../dto/post.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SportType } from '@modules/user/enums/user.enum';
import { Public } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostStatus } from '../entities/post.enum';

@ApiTags('Post')
@Controller('posts')
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Version('1')
	@Post()
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@UseInterceptors(FilesInterceptor('files', 10))
	@ApiOperation({ summary: 'Tạo bài đăng mới' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'Tạo bài đăng với media files',
		schema: {
			type: 'object',
			properties: {
				content: {
					type: 'string',
					description: 'Nội dung bài đăng',
					example: 'Hôm nay tôi đã có một buổi tập tuyệt vời! #fitness #health',
				},
				type: {
					type: 'string',
					enum: ['text', 'image', 'video', 'event'],
					description: 'Loại bài đăng',
					example: 'text',
				},
				sport: {
					type: 'string',
					enum: Object.values(SportType),
					description: 'Môn thể thao liên quan',
					example: 'football',
				},
				approvalStatus: {
					type: 'string',
					enum: Object.values(PostStatus),
					description: 'Trạng thái duyệt bài',
					example: 'approved',
				},
				eventId: {
					type: 'string',
					description: 'ID sự kiện liên quan (chỉ cần cho event post)',
					example: '507f1f77bcf86cd799439011',
				},
				groupId: {
					type: 'string',
					description: 'ID nhóm liên quan',
					example: '507f1f77bcf86cd799439011',
				},
				taggedUsers: {
					type: 'array',
					items: { type: 'string' },
					description: 'Danh sách ID người dùng được tag',
					example: ['507f1f77bcf86cd799439011'],
				},
				sharedFrom: {
					type: 'string',
					description: 'ID bài đăng được share từ',
					example: '507f1f77bcf86cd799439011',
				},
				files: {
					type: 'array',
					items: {
						type: 'string',
						format: 'binary',
					},
					description: 'Media files (images/videos)',
				},
			},
			required: ['content', 'sport', 'approvalStatus'],
		},
	})
	@ApiResponse({
		status: 201,
		description: 'Tạo bài đăng thành công',
		type: PostResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Dữ liệu không hợp lệ',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	async createPost(
		@Request() req,
		@Body() createPostDto: CreatePostDto,
		@UploadedFiles() files: Express.Multer.File[],
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<PostResponseDto>> {
		try {
			const post = await this.postService.createPost(createPostDto, req.user.id, files || [], i18n);

			return {
				success: true,
				data: post,
				message: i18n.t('post.POST_CREATED_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('post.POST_CREATION_FAILED'));
		}
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
}
