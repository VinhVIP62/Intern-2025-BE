import {
	Injectable,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

@Injectable()
export class CommentService {
	constructor(
		@InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
		@InjectModel(Post.name) private readonly postModel: Model<Post>,
	) {}

	async createComment(
		postId: string,
		authorId: string,
		createCommentDto: CreateCommentDto,
		i18n: I18nContext,
	): Promise<Comment> {
		// Validate post exists
		const post = await this.postModel.findById(postId);
		if (!post) {
			throw new NotFoundException(i18n.t('comment.POST_NOT_FOUND'));
		}

		// If this is a reply, validate parent comment exists
		if (createCommentDto.parentId) {
			const parentComment = await this.commentModel.findById(createCommentDto.parentId);
			if (!parentComment) {
				throw new NotFoundException(i18n.t('comment.PARENT_COMMENT_NOT_FOUND'));
			}
			if (parentComment.postId.toString() !== postId) {
				throw new BadRequestException(i18n.t('comment.PARENT_COMMENT_NOT_BELONG_TO_POST'));
			}
		}

		const comment = new this.commentModel({
			postId: new Types.ObjectId(postId),
			author: new Types.ObjectId(authorId),
			content: createCommentDto.content,
			parentId: createCommentDto.parentId ? new Types.ObjectId(createCommentDto.parentId) : null,
		});

		const savedComment = await comment.save();

		// Update post comment count
		await this.postModel.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

		// If this is a reply, update parent comment reply count
		if (createCommentDto.parentId) {
			await this.commentModel.findByIdAndUpdate(createCommentDto.parentId, {
				$inc: { replyCount: 1 },
			});
		}

		return savedComment.populate([
			{ path: 'authorUser', select: 'firstName lastName avatar' },
			{ path: 'post', select: 'content' },
			{ path: 'parentComment', select: 'content author' },
		]);
	}

	async getCommentsByPostId(
		postId: string,
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
	): Promise<PaginatedCommentsResponseDto> {
		// Validate post exists
		const post = await this.postModel.findById(postId);
		if (!post) {
			throw new NotFoundException(i18n.t('comment.POST_NOT_FOUND'));
		}

		const skip = (page - 1) * limit;

		// Get only top-level comments (parentId is null)
		const [comments, total] = await Promise.all([
			this.commentModel
				.find({
					postId: new Types.ObjectId(postId),
					parentId: null,
					isActive: true,
					isHidden: false,
				})
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate([
					{ path: 'authorUser', select: 'firstName lastName avatar' },
					{ path: 'replies', match: { isActive: true, isHidden: false } },
				])
				.exec(),
			this.commentModel.countDocuments({
				postId: new Types.ObjectId(postId),
				parentId: null,
				isActive: true,
				isHidden: false,
			}),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			comments: comments as any as CommentResponseDto[],
			total,
			page,
			limit,
			totalPages,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		};
	}

	async updateComment(
		commentId: string,
		authorId: string,
		updateCommentDto: UpdateCommentDto,
		i18n: I18nContext,
	): Promise<Comment | null> {
		const comment = await this.commentModel.findById(commentId);
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

		const updatedComment = await this.commentModel
			.findByIdAndUpdate(commentId, { $set: updateCommentDto }, { new: true })
			.populate([
				{ path: 'authorUser', select: 'firstName lastName avatar' },
				{ path: 'post', select: 'content' },
				{ path: 'parentComment', select: 'content author' },
			]);

		return updatedComment;
	}

	async deleteComment(commentId: string, authorId: string, i18n: I18nContext): Promise<void> {
		const comment = await this.commentModel.findById(commentId);
		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}

		// Check if user is the author or admin
		if (comment.author.toString() !== authorId) {
			throw new ForbiddenException(i18n.t('comment.NOT_AUTHORIZED_TO_DELETE'));
		}

		// Soft delete - set isActive to false
		await this.commentModel.findByIdAndUpdate(commentId, { isActive: false });

		// Update post comment count
		await this.postModel.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });

		// If this is a reply, update parent comment reply count
		if (comment.parentId) {
			await this.commentModel.findByIdAndUpdate(comment.parentId, { $inc: { replyCount: -1 } });
		}
	}

	async createReply(
		commentId: string,
		authorId: string,
		createReplyDto: CreateReplyDto,
		i18n: I18nContext,
	): Promise<Comment> {
		const parentComment = await this.commentModel.findById(commentId);
		if (!parentComment) {
			throw new NotFoundException(i18n.t('comment.PARENT_COMMENT_NOT_FOUND'));
		}

		if (!parentComment.isActive) {
			throw new BadRequestException(i18n.t('comment.PARENT_COMMENT_IS_INACTIVE'));
		}

		const reply = new this.commentModel({
			postId: parentComment.postId,
			author: new Types.ObjectId(authorId),
			content: createReplyDto.content,
			parentId: new Types.ObjectId(commentId),
		});

		const savedReply = await reply.save();

		// Update post comment count
		await this.postModel.findByIdAndUpdate(parentComment.postId, { $inc: { commentCount: 1 } });

		// Update parent comment reply count
		await this.commentModel.findByIdAndUpdate(commentId, { $inc: { replyCount: 1 } });

		return savedReply.populate([
			{ path: 'authorUser', select: 'firstName lastName avatar' },
			{ path: 'post', select: 'content' },
			{ path: 'parentComment', select: 'content author' },
		]);
	}

	async updateCommentVisibility(
		commentId: string,
		authorId: string,
		updateVisibilityDto: UpdateCommentVisibilityDto,
		i18n: I18nContext,
	): Promise<Comment | null> {
		const comment = await this.commentModel.findById(commentId);
		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}

		// Check if user is the author or admin
		if (comment.author.toString() !== authorId) {
			throw new ForbiddenException(i18n.t('comment.NOT_AUTHORIZED_TO_UPDATE'));
		}

		const updatedComment = await this.commentModel
			.findByIdAndUpdate(commentId, { isHidden: updateVisibilityDto.isHidden }, { new: true })
			.populate([
				{ path: 'authorUser', select: 'firstName lastName avatar' },
				{ path: 'post', select: 'content' },
				{ path: 'parentComment', select: 'content author' },
			]);

		return updatedComment;
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
		const comment = await this.commentModel.findById(commentId).populate([
			{ path: 'authorUser', select: 'firstName lastName avatar' },
			{ path: 'post', select: 'content' },
			{ path: 'parentComment', select: 'content author' },
			{ path: 'replies', match: { isActive: true, isHidden: false } },
		]);

		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}

		return comment;
	}
}
