import {
	Injectable,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nContext } from 'nestjs-i18n';
import { Comment } from '@modules/comment/entities/comment.schema';
import { Post } from '@modules/post/entities/post.schema';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { NotificationType, ReferenceModel } from '@modules/notification/entities/notification.enum';
import {
	CreateCommentDto,
	UpdateCommentDto,
	CreateReplyDto,
	UpdateCommentVisibilityDto,
	PaginatedCommentsResponseDto,
	CommentResponseDto,
	TagUsersDto,
} from '@modules/comment/dto/comment.dto';
import {
	ICommentRepository,
	ICommentRepository as ICommentRepositoryToken,
} from '@modules/comment/repositories/comment.repository';

@Injectable()
export class CommentService {
	constructor(
		@Inject(ICommentRepositoryToken) private readonly commentRepository: ICommentRepository,
		private readonly notificationService: NotificationService,
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

		// Gửi notification cho chủ bài viết (trừ khi người comment chính là chủ bài viết)
		if (post.author.toString() !== authorId) {
			await this.notificationService.createNotification(
				{
					recipient: post.author.toString(),
					sender: authorId,
					type: NotificationType.COMMENT,
					message: `@${authorId} MESSAGE_COMMENT_ON_POST`,
					referenceId: (comment as any)._id.toString(),
					referenceModel: ReferenceModel.COMMENT,
				},
				i18n,
			);
		}

		// Nếu là reply, gửi notification cho chủ comment gốc
		if (createCommentDto.parentId) {
			const parentComment = await this.commentRepository.findCommentById(createCommentDto.parentId);
			if (parentComment && parentComment.author.toString() !== authorId) {
				await this.notificationService.createNotification(
					{
						recipient: parentComment.author.toString(),
						sender: authorId,
						type: NotificationType.COMMENT,
						message: `@${authorId} MESSAGE_REPLY_ON_COMMENT`,
						referenceId: (comment as any)._id.toString(),
						referenceModel: ReferenceModel.COMMENT,
					},
					i18n,
				);
			}
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

		// Hard delete comment and all descendants
		const deleteResult = await this.commentRepository.deleteCommentAndDescendants(commentId);

		// Update post comment count (trừ đi số lượng comment đã xóa)
		await this.commentRepository.updatePostCommentCount(
			comment.postId.toString(),
			-deleteResult.deletedCount,
		);

		// If this is a reply, update parent comment reply count
		if (comment.parentId) {
			// Tính số lượng reply đã xóa (trừ đi comment gốc)
			const deletedRepliesCount = deleteResult.deletedCount - 1;
			if (deletedRepliesCount > 0) {
				await this.commentRepository.updateCommentReplyCount(
					comment.parentId.toString(),
					-deletedRepliesCount,
				);
			}
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

		// Gửi notification cho chủ comment gốc (trừ khi người reply chính là chủ comment gốc)
		if (parentComment.author.toString() !== authorId) {
			await this.notificationService.createNotification(
				{
					recipient: parentComment.author.toString(),
					sender: authorId,
					type: NotificationType.COMMENT,
					message: `@${authorId} MESSAGE_REPLY_ON_COMMENT`,
					referenceId: commentId,
					referenceModel: ReferenceModel.COMMENT,
				},
				i18n,
			);
		}

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
			const updatedComment = await this.commentRepository.likeComment(
				commentId,
				new Types.ObjectId(userId),
			);

			// Gửi notification cho chủ comment (trừ khi người like chính là chủ comment)
			if (comment.author.toString() !== userId) {
				await this.notificationService.createNotification(
					{
						recipient: comment.author.toString(),
						sender: userId,
						type: NotificationType.LIKE,
						message: `@${userId} MESSAGE_LIKE_COMMENT`,
						referenceId: commentId,
						referenceModel: ReferenceModel.COMMENT,
					},
					i18n,
				);
			}

			return updatedComment;
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

	// Tag users vào comment
	async tagUsers(
		commentId: string,
		authorId: string,
		tagUsersDto: TagUsersDto,
		i18n: I18nContext,
	): Promise<Comment> {
		const comment = await this.commentRepository.findCommentById(commentId);
		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}

		// Check if user is the author
		if (comment.author.toString() !== authorId) {
			throw new ForbiddenException(i18n.t('comment.NOT_AUTHORIZED_TO_UPDATE'));
		}

		if (!comment.isActive) {
			throw new BadRequestException(i18n.t('comment.COMMENT_IS_INACTIVE'));
		}

		// Lấy danh sách taggedUsers cũ để so sánh
		const oldTagged = (comment.taggedUsers || []).map(id => id.toString());

		// Convert string IDs to ObjectIds
		const userIds = tagUsersDto.userIds.map(id => new Types.ObjectId(id));

		const updatedComment = await this.commentRepository.tagUsers(commentId, userIds);

		// Tìm những user mới được tag để gửi notification
		const newTagged = tagUsersDto.userIds.filter(id => !oldTagged.includes(id) && id !== authorId);

		// Gửi notification cho các user mới được tag
		if (newTagged.length > 0) {
			await Promise.all(
				newTagged.map(taggedUserId =>
					this.notificationService.createNotification(
						{
							recipient: taggedUserId,
							sender: authorId,
							type: NotificationType.MENTION,
							message: `MESSAGE_TAGGED_IN_COMMENT @${authorId}`,
							referenceId: commentId,
							referenceModel: ReferenceModel.COMMENT,
						},
						i18n,
					),
				),
			);
		}

		return updatedComment;
	}

	// Update toàn bộ danh sách tagged users (thay thế array cũ)
	async updateTaggedUsers(
		commentId: string,
		authorId: string,
		tagUsersDto: TagUsersDto,
		i18n: I18nContext,
	): Promise<Comment> {
		const comment = await this.commentRepository.findCommentById(commentId);
		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}

		// Check if user is the author
		if (comment.author.toString() !== authorId) {
			throw new ForbiddenException(i18n.t('comment.NOT_AUTHORIZED_TO_UPDATE'));
		}

		if (!comment.isActive) {
			throw new BadRequestException(i18n.t('comment.COMMENT_IS_INACTIVE'));
		}

		// Lấy danh sách taggedUsers cũ để so sánh
		const oldTagged = (comment.taggedUsers || []).map(id => id.toString());

		// Convert string IDs to ObjectIds
		const userIds = tagUsersDto.userIds.map(id => new Types.ObjectId(id));

		const updatedComment = await this.commentRepository.updateTaggedUsers(commentId, userIds);

		// Tìm những user mới được tag để gửi notification
		const newTagged = tagUsersDto.userIds.filter(id => !oldTagged.includes(id) && id !== authorId);

		// Gửi notification cho các user mới được tag
		if (newTagged.length > 0) {
			await Promise.all(
				newTagged.map(taggedUserId =>
					this.notificationService.createNotification(
						{
							recipient: taggedUserId,
							sender: authorId,
							type: NotificationType.MENTION,
							message: `MESSAGE_TAGGED_IN_COMMENT @${authorId}`,
							referenceId: commentId,
							referenceModel: ReferenceModel.COMMENT,
						},
						i18n,
					),
				),
			);
		}

		return updatedComment;
	}
}
