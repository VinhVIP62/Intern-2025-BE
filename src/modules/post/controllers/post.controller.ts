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
	ClearUrlDto,
} from '../dto/post.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SportType } from '@modules/user/enums/user.enum';
import { Public } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostAccessLevel, PostStatus } from '../entities/post.enum';

@ApiTags('Post')
@Controller('posts')
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Version('1')
	@Post()
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@UseInterceptors(
		FilesInterceptor('files', 10, {
			limits: {
				fileSize: 15 * 1024 * 1024, // 15MB limit (higher than Cloudinary's 10MB)
			},
			fileFilter: (req, file, cb) => {
				// Check file size before processing
				if (file.size > 10 * 1024 * 1024) {
					// 10MB for Cloudinary
					return cb(new BadRequestException('File size too large. Maximum is 10MB.'), false);
				}
				cb(null, true);
			},
		}),
	)
	@ApiOperation({ summary: 'Tạo bài đăng mới' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({ type: CreatePostDto })
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
			// Handle specific Cloudinary errors
			if (error.message?.includes('Invalid image file')) {
				throw new BadRequestException(i18n.t('post.INVALID_FILE_FORMAT'));
			}

			if (error.message?.includes('File size too large')) {
				throw new BadRequestException(i18n.t('post.FILE_TOO_LARGE'));
			}

			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('post.POST_CREATION_FAILED'));
		}
	}

	@Version('1')
	@Get('all')
	@Public()
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
	@Get()
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy danh sách bài đăng (newsfeed) của user hiện tại' })
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
		@Request() req,
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('sport') sport?: string,
	): Promise<ResponseEntity<PaginatedPostsResponseDto>> {
		const result = await this.postService.getNewsfeed(i18n, page, limit, req.user.id, sport);

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
		@Request() req,
		@Param('postId') postId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<PostResponseDto>> {
		const post = await this.postService.getPostById(postId, i18n, req.user?.id);

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
		@Request() req,
		@Param('userId') userId: string,
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	): Promise<ResponseEntity<PaginatedPostsResponseDto>> {
		const result = await this.postService.getPostsByUserId(userId, i18n, page, limit, req.user?.id);

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
	@UseInterceptors(
		FilesInterceptor('files', 10, {
			limits: {
				fileSize: 15 * 1024 * 1024, // 15MB limit (higher than Cloudinary's 10MB)
			},
			fileFilter: (req, file, cb) => {
				// Check file size before processing
				if (file.size > 10 * 1024 * 1024) {
					// 10MB for Cloudinary
					return cb(new BadRequestException('File size too large. Maximum is 10MB.'), false);
				}
				cb(null, true);
			},
		}),
	)
	@ApiOperation({ summary: 'Cập nhật bài đăng' })
	@ApiConsumes('multipart/form-data')
	@ApiParam({
		name: 'postId',
		description: 'ID của bài đăng',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiBody({ type: UpdatePostDto })
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
		@Request() req,
		@Param('hashtag') hashtag: string,
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	): Promise<ResponseEntity<PaginatedPostsResponseDto>> {
		const result = await this.postService.getPostsByHashtag(
			hashtag,
			i18n,
			page,
			limit,
			req.user?.id,
		);

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

	// ====== LIKE/UNLIKE/GET LIKES API ======

	@Version('1')
	@Post(':postId/like')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Like một bài đăng' })
	@ApiParam({ name: 'postId', description: 'ID của bài đăng', example: '507f1f77bcf86cd799439011' })
	@ApiResponse({ status: 200, description: 'Like thành công', type: PostResponseDto })
	@ApiResponse({ status: 400, description: 'Đã like hoặc dữ liệu không hợp lệ' })
	@ApiResponse({ status: 404, description: 'Không tìm thấy bài đăng' })
	async likePost(
		@Request() req,
		@Param('postId') postId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<PostResponseDto>> {
		const post = await this.postService.likePost(postId, req.user.id, i18n);
		return {
			success: true,
			data: post,
			message: i18n.t('post.LIKE_SUCCESS'),
		};
	}

	@Version('1')
	@Delete(':postId/like')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Bỏ like một bài đăng' })
	@ApiParam({ name: 'postId', description: 'ID của bài đăng', example: '507f1f77bcf86cd799439011' })
	@ApiResponse({ status: 200, description: 'Bỏ like thành công', type: PostResponseDto })
	@ApiResponse({ status: 400, description: 'Chưa like hoặc dữ liệu không hợp lệ' })
	@ApiResponse({ status: 404, description: 'Không tìm thấy bài đăng' })
	async unlikePost(
		@Request() req,
		@Param('postId') postId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<PostResponseDto>> {
		const post = await this.postService.unlikePost(postId, req.user.id, i18n);
		return {
			success: true,
			data: post,
			message: i18n.t('post.UNLIKE_SUCCESS'),
		};
	}

	@Version('1')
	@Get(':postId/likes')
	@Public()
	@ApiOperation({ summary: 'Lấy danh sách user đã like bài đăng' })
	@ApiParam({ name: 'postId', description: 'ID của bài đăng', example: '507f1f77bcf86cd799439011' })
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách like thành công',
		schema: {
			example: {
				success: true,
				data: {
					likes: [
						{ userId: '507f1f77bcf86cd799439011', fullName: 'Nguyen Van A', avatar: 'https://...' },
						{ userId: '507f1f77bcf86cd799439012', fullName: 'Tran Thi B', avatar: 'https://...' },
					],
					likeCount: 2,
				},
				message: '...',
			},
		},
	})
	@ApiResponse({ status: 404, description: 'Không tìm thấy bài đăng' })
	async getPostLikes(
		@Param('postId') postId: string,
		@I18n() i18n: I18nContext,
	): Promise<
		ResponseEntity<{
			likes: { userId: string; fullName: string; avatar: string }[];
			likeCount: number;
		}>
	> {
		const data = await this.postService.getPostLikesWithUserInfo(postId, i18n);
		return {
			success: true,
			data,
			message: i18n.t('post.LIKES_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Get('all/trending')
	@Public()
	@ApiOperation({ summary: 'Lấy danh sách bài đăng trending (nhiều like/comment)' })
	@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
	@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
	@ApiQuery({ name: 'sport', required: false, enum: Object.values(SportType) })
	@ApiQuery({ name: 'userId', required: false, type: String })
	@ApiQuery({ name: 'timeRange', required: false, type: String, example: '7d' })
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách bài đăng trending thành công',
		type: PaginatedPostsResponseDto,
	})
	async getTrendingPosts(
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('sport') sport?: string,
		@Query('userId') userId?: string,
		@Query('timeRange') timeRange?: string,
		@Request() req?: any,
	): Promise<ResponseEntity<PaginatedPostsResponseDto>> {
		const result = await this.postService.getTrendingPosts(
			i18n,
			page,
			limit,
			sport,
			userId,
			req?.user?.id,
			timeRange,
		);
		return {
			success: true,
			data: result,
			message: i18n.t('post.TRENDING_POSTS_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Delete(':postId/clear-url')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Xóa images và video của bài đăng (clearUrl)' })
	@ApiParam({ name: 'postId', description: 'ID của bài đăng', example: '507f1f77bcf86cd799439011' })
	@ApiBody({ type: ClearUrlDto })
	@ApiResponse({ status: 200, description: 'Xóa thành công', type: PostResponseDto })
	@ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
	@ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
	@ApiResponse({ status: 403, description: 'Không có quyền chỉnh sửa bài đăng này' })
	async clearUrl(
		@Request() req,
		@Param('postId') postId: string,
		@Body() clearUrlDto: ClearUrlDto,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.postService.clearUrl(
			postId,
			req.user.id,
			clearUrlDto.isClearImage ?? false,
			clearUrlDto.isClearVideo ?? false,
			i18n,
		);
		return {
			success: true,
			message: i18n.t('post.CLEAR_URL_SUCCESS'),
		};
	}
}
