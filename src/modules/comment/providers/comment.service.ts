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

		// Lấy tất cả comment của post (isActive)
		const allComments = (await this.commentModel
			.find({
				postId: new Types.ObjectId(postId),
				isActive: true,
			})
			.sort({ createdAt: -1 })
			.populate([{ path: 'authorUser', select: 'firstName lastName avatar' }])
			.lean()) as any[];

		// Xây dựng map commentId -> comment
		const commentMap = new Map();
		allComments.forEach(c => {
			c.replies = [];
			commentMap.set(String(c._id), c);
		});

		// Xây dựng cây comment
		const rootComments: any[] = [];
		allComments.forEach(c => {
			if (c.parentId) {
				const parent = commentMap.get(String(c.parentId));
				if (parent) {
					parent.replies.push(c);
				}
			} else {
				rootComments.push(c);
			}
		});

		// Phân trang trên root comments
		const total = rootComments.length;
		const totalPages = Math.ceil(total / limit);
		const pagedRootComments = rootComments.slice((page - 1) * limit, page * limit);

		return {
			comments: pagedRootComments as any as CommentResponseDto[],
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
		userId: string,
		updateVisibilityDto: UpdateCommentVisibilityDto,
		i18n: I18nContext,
	): Promise<Comment | null> {
		const comment = await this.commentModel.findById(commentId);
		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}
		// Lấy post để kiểm tra quyền
		const post = await this.postModel.findById(comment.postId);
		if (!post) {
			throw new NotFoundException(i18n.t('comment.POST_NOT_FOUND'));
		}
		// Chỉ chủ comment hoặc chủ post mới được phép
		if (comment.author.toString() !== userId && post.author.toString() !== userId) {
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

	async likeComment(commentId: string, userId: string, i18n: I18nContext): Promise<Comment> {
		const comment = await this.commentModel.findById(commentId);
		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}
		if (!comment.isActive || comment.isHidden) {
			throw new BadRequestException(i18n.t('comment.COMMENT_IS_INACTIVE'));
		}
		const userObjectId = new Types.ObjectId(userId);
		if (comment.likes.some(id => id.equals(userObjectId))) {
			throw new BadRequestException(i18n.t('comment.ALREADY_LIKED'));
		}
		comment.likes.push(userObjectId);
		comment.likeCount = comment.likes.length;
		await comment.save();
		return comment.populate([
			{ path: 'authorUser', select: 'firstName lastName avatar' },
			{ path: 'post', select: 'content' },
			{ path: 'parentComment', select: 'content author' },
		]);
	}

	async unlikeComment(commentId: string, userId: string, i18n: I18nContext): Promise<Comment> {
		const comment = await this.commentModel.findById(commentId);
		if (!comment) {
			throw new NotFoundException(i18n.t('comment.COMMENT_NOT_FOUND'));
		}
		if (!comment.isActive || comment.isHidden) {
			throw new BadRequestException(i18n.t('comment.COMMENT_IS_INACTIVE'));
		}
		const userObjectId = new Types.ObjectId(userId);
		const idx = comment.likes.findIndex(id => id.equals(userObjectId));
		if (idx === -1) {
			throw new BadRequestException(i18n.t('comment.NOT_LIKED'));
		}
		comment.likes.splice(idx, 1);
		comment.likeCount = comment.likes.length;
		await comment.save();
		return comment.populate([
			{ path: 'authorUser', select: 'firstName lastName avatar' },
			{ path: 'post', select: 'content' },
			{ path: 'parentComment', select: 'content author' },
		]);
	}

	// Xóa cứng toàn bộ comment của một bài post (theo postId)
	async deleteCommentsByPostId(postId: string, i18n: I18nContext): Promise<number> {
		// Kiểm tra post tồn tại
		const post = await this.postModel.findById(postId);
		if (!post) {
			throw new NotFoundException(i18n.t('comment.POST_NOT_FOUND'));
		}
		const result = await this.commentModel.deleteMany({ postId: new Types.ObjectId(postId) });
		return result.deletedCount || 0;
	}
}
