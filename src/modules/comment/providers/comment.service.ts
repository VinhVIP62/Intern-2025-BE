import {
	Injectable,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nContext } from 'nestjs-i18n';
import { Comment } from '../entities/comment.schema';
import { Post } from '@modules/post/entities/post.schema';
import {
	CreateCommentDto,
	UpdateCommentDto,
	CreateReplyDto,
	UpdateCommentVisibilityDto,
	PaginatedCommentsResponseDto,
	CommentResponseDto,
} from '../dto/comment.dto';
import {
	ICommentRepository,
	ICommentRepository as ICommentRepositoryToken,
} from '../repositories/comment.repository';

@Injectable()
export class CommentService {
	constructor(
		@Inject(ICommentRepositoryToken) private readonly commentRepository: ICommentRepository,
	) {}

	async createComment(
		postId: string,
		authorId: string,
		createCommentDto: CreateCommentDto,
		i18n: I18nContext,
	): Promise<Comment> {
		// Validate post exists
		const post = await this.commentRepository.findPostById(postId);
		if (!post) {
			throw new NotFoundException(i18n.t('comment.POST_NOT_FOUND'));
		}

		// If this is a reply, validate parent comment exists
		if (createCommentDto.parentId) {
			const parentComment = await this.commentRepository.findCommentById(createCommentDto.parentId);
			if (!parentComment) {
				throw new NotFoundException(i18n.t('comment.PARENT_COMMENT_NOT_FOUND'));
			}
			if (parentComment.postId.toString() !== postId) {
				throw new BadRequestException(i18n.t('comment.PARENT_COMMENT_NOT_BELONG_TO_POST'));
			}
		}

		const comment = await this.commentRepository.createComment({
			postId: new Types.ObjectId(postId),
			author: new Types.ObjectId(authorId),
			content: createCommentDto.content,
			parentId: createCommentDto.parentId ? new Types.ObjectId(createCommentDto.parentId) : null,
		});

		// Update post comment count
		await this.commentRepository.updatePostCommentCount(postId, 1);

		// If this is a reply, update parent comment reply count
		if (createCommentDto.parentId) {
			await this.commentRepository.updateCommentReplyCount(createCommentDto.parentId, 1);
		}

		return comment;
	}

	async getCommentsByPostId(
		postId: string,
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
	): Promise<PaginatedCommentsResponseDto> {
		// Validate post exists
		const post = await this.commentRepository.findPostById(postId);
		if (!post) {
			throw new NotFoundException(i18n.t('comment.POST_NOT_FOUND'));
		}

		return this.commentRepository.getPaginatedComments(postId, page, limit);
	}

	async updateComment(
		commentId: string,
		authorId: string,
		updateCommentDto: UpdateCommentDto,
		i18n: I18nContext,
	): Promise<Comment | null> {
		const comment = await this.commentRepository.findCommentById(commentId);
		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}

		// Check if user is the author or admin
		if (comment.author.toString() !== authorId) {
			throw new ForbiddenException(i18n.t('comment.NOT_AUTHORIZED_TO_UPDATE'));
		}

		if (!comment.isActive) {
			throw new BadRequestException(i18n.t('comment.COMMENT_IS_INACTIVE'));
		}

		return this.commentRepository.updateComment(commentId, updateCommentDto);
	}

	async deleteComment(commentId: string, authorId: string, i18n: I18nContext): Promise<void> {
		const comment = await this.commentRepository.findCommentById(commentId);
		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}

		// Check if user is the author or admin
		if (comment.author.toString() !== authorId) {
			throw new ForbiddenException(i18n.t('comment.NOT_AUTHORIZED_TO_DELETE'));
		}

		// Soft delete - set isActive to false
		await this.commentRepository.softDeleteComment(commentId);

		// Update post comment count
		await this.commentRepository.updatePostCommentCount(comment.postId.toString(), -1);

		// If this is a reply, update parent comment reply count
		if (comment.parentId) {
			await this.commentRepository.updateCommentReplyCount(comment.parentId.toString(), -1);
		}
	}

	async createReply(
		commentId: string,
		authorId: string,
		createReplyDto: CreateReplyDto,
		i18n: I18nContext,
	): Promise<Comment> {
		const parentComment = await this.commentRepository.findCommentById(commentId);
		if (!parentComment) {
			throw new NotFoundException(i18n.t('comment.PARENT_COMMENT_NOT_FOUND'));
		}

		if (!parentComment.isActive) {
			throw new BadRequestException(i18n.t('comment.PARENT_COMMENT_IS_INACTIVE'));
		}

		const reply = await this.commentRepository.createComment({
			postId: parentComment.postId,
			author: new Types.ObjectId(authorId),
			content: createReplyDto.content,
			parentId: new Types.ObjectId(commentId),
		});

		// Update post comment count
		await this.commentRepository.updatePostCommentCount(parentComment.postId.toString(), 1);

		// Update parent comment reply count
		await this.commentRepository.updateCommentReplyCount(commentId, 1);

		return reply;
	}

	async updateCommentVisibility(
		commentId: string,
		userId: string,
		updateVisibilityDto: UpdateCommentVisibilityDto,
		i18n: I18nContext,
	): Promise<Comment | null> {
		const comment = await this.commentRepository.findCommentById(commentId);
		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}
		// Lấy post để kiểm tra quyền
		const post = await this.commentRepository.findPostById(comment.postId.toString());
		if (!post) {
			throw new NotFoundException(i18n.t('comment.POST_NOT_FOUND'));
		}
		// Chỉ chủ comment hoặc chủ post mới được phép
		if (comment.author.toString() !== userId && post.author.toString() !== userId) {
			throw new ForbiddenException(i18n.t('comment.NOT_AUTHORIZED_TO_UPDATE'));
		}
		return this.commentRepository.updateCommentVisibility(commentId, updateVisibilityDto.isHidden);
	}

	async hideComment(
		commentId: string,
		authorId: string,
		i18n: I18nContext,
	): Promise<Comment | null> {
		return this.updateCommentVisibility(commentId, authorId, { isHidden: true }, i18n);
	}

	async showComment(
		commentId: string,
		authorId: string,
		i18n: I18nContext,
	): Promise<Comment | null> {
		return this.updateCommentVisibility(commentId, authorId, { isHidden: false }, i18n);
	}

	async getCommentById(commentId: string, i18n: I18nContext): Promise<Comment | null> {
		const comment = await this.commentRepository.findCommentById(commentId);

		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}

		return comment;
	}

	async likeComment(commentId: string, userId: string, i18n: I18nContext): Promise<Comment> {
		const comment = await this.commentRepository.findCommentById(commentId);
		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}
		if (!comment.isActive || comment.isHidden) {
			throw new BadRequestException(i18n.t('comment.COMMENT_IS_INACTIVE'));
		}

		try {
			return await this.commentRepository.likeComment(commentId, new Types.ObjectId(userId));
		} catch (error) {
			if (error.message === 'Already liked') {
				throw new BadRequestException(i18n.t('comment.ALREADY_LIKED'));
			}
			throw error;
		}
	}

	async unlikeComment(commentId: string, userId: string, i18n: I18nContext): Promise<Comment> {
		const comment = await this.commentRepository.findCommentById(commentId);
		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}
		if (!comment.isActive || comment.isHidden) {
			throw new BadRequestException(i18n.t('comment.COMMENT_IS_INACTIVE'));
		}

		try {
			return await this.commentRepository.unlikeComment(commentId, new Types.ObjectId(userId));
		} catch (error) {
			if (error.message === 'Not liked') {
				throw new BadRequestException(i18n.t('comment.NOT_LIKED'));
			}
			throw error;
		}
	}

	// Xóa cứng toàn bộ comment của một bài post (theo postId)
	async deleteCommentsByPostId(postId: string, i18n: I18nContext): Promise<number> {
		// Kiểm tra post tồn tại
		const post = await this.commentRepository.findPostById(postId);
		if (!post) {
			throw new NotFoundException(i18n.t('comment.POST_NOT_FOUND'));
		}
		return this.commentRepository.deleteCommentsByPostId(postId);
	}
}
