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
	ForbiddenException,
	Delete,
	Put,
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
import {
	PostResponseDto,
	PaginatedPostsResponseDto,
	CreatePostDto,
	UpdatePostDto,
	TrendingHashtagsResponseDto,
} from '../dto/post.dto';
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

	@Version('1')
	@Put(':postId')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@UseInterceptors(FilesInterceptor('files', 10))
	@ApiOperation({ summary: 'Cập nhật bài đăng' })
	@ApiConsumes('multipart/form-data')
	@ApiParam({
		name: 'postId',
		description: 'ID của bài đăng',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiBody({
		description: 'Cập nhật bài đăng',
		schema: {
			type: 'object',
			properties: {
				content: {
					type: 'string',
					description: 'Nội dung bài đăng',
					example: 'Cập nhật nội dung bài đăng! #updated #fitness',
				},
				sport: {
					type: 'string',
					enum: Object.values(SportType),
					description: 'Môn thể thao liên quan',
					example: 'football',
				},
				eventId: {
					type: 'string',
					description: 'ID sự kiện liên quan',
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
				files: {
					type: 'array',
					items: {
						type: 'string',
						format: 'binary',
					},
					description: 'Media files (images/videos)',
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Cập nhật bài đăng thành công',
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
	@ApiResponse({
		status: 403,
		description: 'Không có quyền chỉnh sửa bài đăng này',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy bài đăng',
	})
	async updatePost(
		@Request() req,
		@Param('postId') postId: string,
		@Body() updatePostDto: UpdatePostDto,
		@UploadedFiles() files: Express.Multer.File[],
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<PostResponseDto>> {
		try {
			const post = await this.postService.updatePost(
				postId,
				updatePostDto,
				req.user.id,
				files || [],
				i18n,
			);

			return {
				success: true,
				data: post,
				message: i18n.t('post.POST_UPDATED_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('post.POST_UPDATE_FAILED'));
		}
	}

	@Version('1')
	@Delete(':postId')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Xóa bài đăng' })
	@ApiParam({
		name: 'postId',
		description: 'ID của bài đăng',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Xóa bài đăng thành công',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	@ApiResponse({
		status: 403,
		description: 'Không có quyền xóa bài đăng này',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy bài đăng',
	})
	async deletePost(
		@Request() req,
		@Param('postId') postId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		try {
			await this.postService.deletePost(postId, req.user.id, i18n);

			return {
				success: true,
				message: i18n.t('post.POST_DELETED_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('post.POST_DELETE_FAILED'));
		}
	}

	@Version('1')
	@Get('hashtags/trending')
	@Public()
	@ApiOperation({ summary: 'Lấy danh sách hashtag trending' })
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
		description: 'Số lượng hashtag trên mỗi trang (mặc định: 10)',
		example: 10,
	})
	@ApiQuery({
		name: 'timeRange',
		required: false,
		type: String,
		description: 'Khoảng thời gian (7d, 30d, 90d, all)',
		example: '7d',
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách hashtag trending thành công',
		type: TrendingHashtagsResponseDto,
	})
	async getTrendingHashtags(
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('timeRange') timeRange?: string,
	): Promise<ResponseEntity<TrendingHashtagsResponseDto>> {
		const result = await this.postService.getTrendingHashtags(i18n, page, limit, timeRange);

		return {
			success: true,
			data: result,
			message: i18n.t('post.TRENDING_HASHTAGS_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Get('hashtags/:hashtag/posts')
	@Public()
	@ApiOperation({ summary: 'Lấy danh sách bài đăng theo hashtag' })
	@ApiParam({
		name: 'hashtag',
		description: 'Tên hashtag (có thể có hoặc không có dấu #)',
		example: 'fitness',
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
		description: 'Lấy danh sách bài đăng theo hashtag thành công',
		type: PaginatedPostsResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy bài đăng với hashtag này',
	})
	async getPostsByHashtag(
		@Param('hashtag') hashtag: string,
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	): Promise<ResponseEntity<PaginatedPostsResponseDto>> {
		const result = await this.postService.getPostsByHashtag(hashtag, i18n, page, limit);

		return {
			success: true,
			data: result,
			message: i18n.t('post.HASHTAG_POSTS_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Put(':postId/tag-friends')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Tag bạn bè vào bài đăng (thay thế toàn bộ danh sách)' })
	@ApiParam({ name: 'postId', description: 'ID của bài đăng', example: '507f1f77bcf86cd799439011' })
	@ApiBody({
		description: 'Tag bạn bè (thay thế toàn bộ danh sách)',
		schema: {
			type: 'object',
			properties: {
				friendIds: {
					type: 'array',
					items: { type: 'string' },
					description: 'Danh sách ID người dùng được tag',
					example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
				},
			},
			required: ['friendIds'],
		},
	})
	@ApiResponse({ status: 200, description: 'Tag bạn bè thành công', type: PostResponseDto })
	@ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
	@ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
	@ApiResponse({ status: 403, description: 'Không có quyền chỉnh sửa bài đăng này' })
	async tagFriend(
		@Request() req,
		@Param('postId') postId: string,
		@Body('friendIds') friendIds: string[],
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<PostResponseDto>> {
		const post = await this.postService.replaceTaggedFriends(postId, req.user.id, friendIds, i18n);
		return {
			success: true,
			data: post,
			message: i18n.t('post.TAG_FRIEND_SUCCESS'),
		};
	}
}
