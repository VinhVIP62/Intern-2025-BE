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
	BadRequestException,
	ForbiddenException,
	Delete,
	Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CommentService } from '../providers/comment.service';
import { ResponseEntity } from '@common/types';
import {
	CommentResponseDto,
	PaginatedCommentsResponseDto,
	CreateCommentDto,
	UpdateCommentDto,
	CreateReplyDto,
	UpdateCommentVisibilityDto,
} from '../dto/comment.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Public } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';

@ApiTags('Comment')
@Controller('comments')
export class CommentController {
	constructor(private readonly commentService: CommentService) {}

	@Version('1')
	@Post('posts/:postId/comments')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Tạo comment mới cho bài đăng' })
	@ApiParam({
		name: 'postId',
		description: 'ID của bài đăng',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiBody({
		description: 'Tạo comment mới',
		schema: {
			type: 'object',
			properties: {
				content: {
					type: 'string',
					description: 'Nội dung comment',
					example: 'Bài viết rất hay! Cảm ơn bạn đã chia sẻ.',
				},
				parentId: {
					type: 'string',
					description: 'ID comment cha (cho reply)',
					example: '507f1f77bcf86cd799439011',
				},
			},
			required: ['content'],
		},
	})
	@ApiResponse({
		status: 201,
		description: 'Tạo comment thành công',
		type: CommentResponseDto,
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
		status: 404,
		description: 'Không tìm thấy bài đăng hoặc comment cha',
	})
	async createComment(
		@Request() req,
		@Param('postId') postId: string,
		@Body() createCommentDto: CreateCommentDto,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<CommentResponseDto>> {
		try {
			const comment = await this.commentService.createComment(
				postId,
				req.user.id,
				createCommentDto,
				i18n,
			);

			return {
				success: true,
				data: comment as any as CommentResponseDto,
				message: i18n.t('comment.COMMENT_CREATED_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('comment.COMMENT_CREATION_FAILED'));
		}
	}

	@Version('1')
	@Get('posts/:postId/comments')
	@Public()
	@ApiOperation({ summary: 'Lấy danh sách comment của bài đăng' })
	@ApiParam({
		name: 'postId',
		description: 'ID của bài đăng',
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
		description: 'Số lượng comment trên mỗi trang (mặc định: 10)',
		example: 10,
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách comment thành công',
		type: PaginatedCommentsResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy bài đăng',
	})
	async getCommentsByPostId(
		@Param('postId') postId: string,
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	): Promise<ResponseEntity<PaginatedCommentsResponseDto>> {
		const result = await this.commentService.getCommentsByPostId(postId, i18n, page, limit);

		return {
			success: true,
			data: {
				...result,
				comments: result.comments.map(comment => comment as any as CommentResponseDto),
			},
			message: i18n.t('comment.COMMENTS_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Put(':commentId')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Cập nhật comment' })
	@ApiParam({
		name: 'commentId',
		description: 'ID của comment',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiBody({
		description: 'Cập nhật comment',
		schema: {
			type: 'object',
			properties: {
				content: {
					type: 'string',
					description: 'Nội dung comment',
					example: 'Cập nhật nội dung comment!',
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Cập nhật comment thành công',
		type: CommentResponseDto,
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
		description: 'Không có quyền chỉnh sửa comment này',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy comment',
	})
	async updateComment(
		@Request() req,
		@Param('commentId') commentId: string,
		@Body() updateCommentDto: UpdateCommentDto,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<CommentResponseDto>> {
		try {
			const comment = await this.commentService.updateComment(
				commentId,
				req.user.id,
				updateCommentDto,
				i18n,
			);

			if (!comment) {
				throw new BadRequestException(i18n.t('comment.COMMENT_NOT_FOUND'));
			}

			return {
				success: true,
				data: comment as any as CommentResponseDto,
				message: i18n.t('comment.COMMENT_UPDATED_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('comment.COMMENT_UPDATE_FAILED'));
		}
	}

	@Version('1')
	@Delete(':commentId')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Xóa comment' })
	@ApiParam({
		name: 'commentId',
		description: 'ID của comment',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Xóa comment thành công',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	@ApiResponse({
		status: 403,
		description: 'Không có quyền xóa comment này',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy comment',
	})
	async deleteComment(
		@Request() req,
		@Param('commentId') commentId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		try {
			await this.commentService.deleteComment(commentId, req.user.id, i18n);

			return {
				success: true,
				message: i18n.t('comment.COMMENT_DELETED_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('comment.COMMENT_DELETE_FAILED'));
		}
	}

	@Version('1')
	@Post(':commentId/reply')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Tạo reply cho comment' })
	@ApiParam({
		name: 'commentId',
		description: 'ID của comment cha',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiBody({
		description: 'Tạo reply',
		schema: {
			type: 'object',
			properties: {
				content: {
					type: 'string',
					description: 'Nội dung reply',
					example: 'Tôi đồng ý với bạn!',
				},
			},
			required: ['content'],
		},
	})
	@ApiResponse({
		status: 201,
		description: 'Tạo reply thành công',
		type: CommentResponseDto,
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
		status: 404,
		description: 'Không tìm thấy comment cha',
	})
	async createReply(
		@Request() req,
		@Param('commentId') commentId: string,
		@Body() createReplyDto: CreateReplyDto,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<CommentResponseDto>> {
		try {
			const reply = await this.commentService.createReply(
				commentId,
				req.user.id,
				createReplyDto,
				i18n,
			);

			return {
				success: true,
				data: reply as any as CommentResponseDto,
				message: i18n.t('comment.REPLY_CREATED_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('comment.REPLY_CREATION_FAILED'));
		}
	}

	@Version('1')
	@Put(':commentId/hidden')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Ẩn comment' })
	@ApiParam({
		name: 'commentId',
		description: 'ID của comment',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Ẩn comment thành công',
		type: CommentResponseDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	@ApiResponse({
		status: 403,
		description: 'Không có quyền chỉnh sửa comment này',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy comment',
	})
	async hideComment(
		@Request() req,
		@Param('commentId') commentId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<CommentResponseDto>> {
		try {
			const comment = await this.commentService.hideComment(commentId, req.user.id, i18n);

			if (!comment) {
				throw new BadRequestException(i18n.t('comment.COMMENT_NOT_FOUND'));
			}

			return {
				success: true,
				data: comment as any as CommentResponseDto,
				message: i18n.t('comment.COMMENT_HIDDEN_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('comment.COMMENT_HIDE_FAILED'));
		}
	}

	@Version('1')
	@Put(':commentId/show')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Hiện comment' })
	@ApiParam({
		name: 'commentId',
		description: 'ID của comment',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Hiện comment thành công',
		type: CommentResponseDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	@ApiResponse({
		status: 403,
		description: 'Không có quyền chỉnh sửa comment này',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy comment',
	})
	async showComment(
		@Request() req,
		@Param('commentId') commentId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<CommentResponseDto>> {
		try {
			const comment = await this.commentService.showComment(commentId, req.user.id, i18n);

			if (!comment) {
				throw new BadRequestException(i18n.t('comment.COMMENT_NOT_FOUND'));
			}

			return {
				success: true,
				data: comment as any as CommentResponseDto,
				message: i18n.t('comment.COMMENT_SHOWN_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('comment.COMMENT_SHOW_FAILED'));
		}
	}
}
