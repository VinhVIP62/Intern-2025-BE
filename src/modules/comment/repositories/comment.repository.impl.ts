import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICommentRepository } from '../interfaces/comment.repository';
import { Comment } from '@modules/comment/entities/comment.schema';
import { Post } from '@modules/post/entities/post.schema';
import {
	UpdateCommentDto,
	PaginatedCommentsResponseDto,
	CommentResponseDto,
} from '@modules/comment/dto/comment.dto';

@Injectable()
export class CommentRepositoryImpl implements ICommentRepository {
	constructor(
		@InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
		@InjectModel(Post.name) private readonly postModel: Model<Post>,
	) {}

	// Post operations
	async findPostById(postId: string): Promise<Post | null> {
		return this.postModel.findById(postId);
	}

	async updatePostCommentCount(postId: string, increment: number): Promise<void> {
		await this.postModel.findByIdAndUpdate(postId, { $inc: { commentCount: increment } });
	}

	// Comment CRUD operations
	async createComment(commentData: {
		postId: Types.ObjectId;
		author: Types.ObjectId;
		content: string;
		parentId?: Types.ObjectId | null;
	}): Promise<Comment> {
		const comment = new this.commentModel(commentData);
		const savedComment = await comment.save();

		return savedComment.populate([
			{ path: 'authorUser', select: 'firstName lastName avatar' },
			{ path: 'post', select: 'content' },
			{ path: 'parentComment', select: 'content author' },
			{ path: 'taggedUsersList', select: 'firstName lastName avatar' },
		]);
	}

	async findCommentById(commentId: string): Promise<Comment | null> {
		return this.commentModel.findById(commentId).populate([
			{ path: 'authorUser', select: 'firstName lastName avatar' },
			{ path: 'post', select: 'content' },
			{ path: 'parentComment', select: 'content author' },
			{ path: 'replies', match: { isActive: true, isHidden: false } },
			{ path: 'taggedUsersList', select: 'firstName lastName avatar' },
		]);
	}

	async findCommentsByPostId(postId: string): Promise<Comment[]> {
		return this.commentModel
			.find({
				postId: new Types.ObjectId(postId),
				isActive: true,
			})
			.sort({ createdAt: -1 })
			.populate([
				{ path: 'authorUser', select: 'firstName lastName avatar' },
				{ path: 'taggedUsersList', select: 'firstName lastName avatar' },
			])
			.lean();
	}

	async updateComment(commentId: string, updateData: UpdateCommentDto): Promise<Comment | null> {
		return this.commentModel
			.findByIdAndUpdate(commentId, { $set: updateData }, { new: true })
			.populate([
				{ path: 'authorUser', select: 'firstName lastName avatar' },
				{ path: 'post', select: 'content' },
				{ path: 'parentComment', select: 'content author' },
				{ path: 'taggedUsersList', select: 'firstName lastName avatar' },
			]);
	}

	async softDeleteComment(commentId: string): Promise<void> {
		await this.commentModel.findByIdAndUpdate(commentId, { isActive: false });
	}

	async deleteCommentsByPostId(postId: string): Promise<number> {
		const result = await this.commentModel.deleteMany({ postId: new Types.ObjectId(postId) });
		return result.deletedCount || 0;
	}

	// Reply operations
	async updateCommentReplyCount(commentId: string, increment: number): Promise<void> {
		await this.commentModel.findByIdAndUpdate(commentId, { $inc: { replyCount: increment } });
	}

	// Visibility operations
	async updateCommentVisibility(commentId: string, isHidden: boolean): Promise<Comment | null> {
		return this.commentModel.findByIdAndUpdate(commentId, { isHidden }, { new: true }).populate([
			{ path: 'authorUser', select: 'firstName lastName avatar' },
			{ path: 'post', select: 'content' },
			{ path: 'parentComment', select: 'content author' },
			{ path: 'taggedUsersList', select: 'firstName lastName avatar' },
		]);
	}

	// Like operations
	async likeComment(commentId: string, userId: Types.ObjectId): Promise<Comment> {
		const comment = await this.commentModel.findById(commentId);
		if (!comment) {
			throw new Error('Comment not found');
		}

		if (comment.likes.some(id => id.equals(userId))) {
			throw new Error('Already liked');
		}

		comment.likes.push(userId);
		comment.likeCount = comment.likes.length;
		await comment.save();

		return comment.populate([
			{ path: 'authorUser', select: 'firstName lastName avatar' },
			{ path: 'post', select: 'content' },
			{ path: 'parentComment', select: 'content author' },
			{ path: 'taggedUsersList', select: 'firstName lastName avatar' },
		]);
	}

	async unlikeComment(commentId: string, userId: Types.ObjectId): Promise<Comment> {
		const comment = await this.commentModel.findById(commentId);
		if (!comment) {
			throw new Error('Comment not found');
		}

		const idx = comment.likes.findIndex(id => id.equals(userId));
		if (idx === -1) {
			throw new Error('Not liked');
		}

		comment.likes.splice(idx, 1);
		comment.likeCount = comment.likes.length;
		await comment.save();

		return comment.populate([
			{ path: 'authorUser', select: 'firstName lastName avatar' },
			{ path: 'post', select: 'content' },
			{ path: 'parentComment', select: 'content author' },
			{ path: 'taggedUsersList', select: 'firstName lastName avatar' },
		]);
	}

	// Pagination
	async getPaginatedComments(
		postId: string,
		page: number,
		limit: number,
	): Promise<PaginatedCommentsResponseDto> {
		// Lấy tất cả comment của post (isActive)
		const allComments = await this.findCommentsByPostId(postId);

		// Xây dựng map commentId -> comment
		const commentMap = new Map();
		allComments.forEach(c => {
			(c as any).replies = [];
			commentMap.set(String(c._id), c);
		});

		// Xây dựng cây comment
		const rootComments: any[] = [];
		allComments.forEach(c => {
			if (c.parentId) {
				const parent = commentMap.get(String(c.parentId));
				if (parent) {
					(parent as any).replies.push(c);
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

	// Tagged users operations
	async tagUsers(commentId: string, userIds: Types.ObjectId[]): Promise<Comment> {
		const comment = await this.commentModel.findById(commentId);
		if (!comment) {
			throw new Error('Comment not found');
		}

		// Thêm các user mới vào taggedUsers (tránh duplicate)
		userIds.forEach(userId => {
			if (!comment.taggedUsers.some(id => id.equals(userId))) {
				comment.taggedUsers.push(userId);
			}
		});

		await comment.save();

		return comment.populate([
			{ path: 'authorUser', select: 'firstName lastName avatar' },
			{ path: 'post', select: 'content' },
			{ path: 'parentComment', select: 'content author' },
			{ path: 'taggedUsersList', select: 'firstName lastName avatar' },
		]);
	}

	async updateTaggedUsers(commentId: string, userIds: Types.ObjectId[]): Promise<Comment> {
		const comment = await this.commentModel.findById(commentId);
		if (!comment) {
			throw new Error('Comment not found');
		}

		// Thay thế toàn bộ danh sách taggedUsers
		comment.taggedUsers = userIds;
		await comment.save();

		return comment.populate([
			{ path: 'authorUser', select: 'firstName lastName avatar' },
			{ path: 'post', select: 'content' },
			{ path: 'parentComment', select: 'content author' },
			{ path: 'taggedUsersList', select: 'firstName lastName avatar' },
		]);
	}

	// Hard delete comment and all descendants using MongoDB aggregation
	async deleteCommentAndDescendants(
		commentId: string,
	): Promise<{ deletedCount: number; deletedCommentIds: string[] }> {
		// Sử dụng $graphLookup để tìm tất cả comment con, cháu
		const result = await this.commentModel.aggregate([
			{
				$match: { _id: new Types.ObjectId(commentId) },
			},
			{
				$graphLookup: {
					from: 'comments',
					startWith: '$_id',
					connectFromField: '_id',
					connectToField: 'parentId',
					as: 'descendants',
					depthField: 'depth',
				},
			},
			{
				$project: {
					_id: 1,
					descendantIds: '$descendants._id',
				},
			},
		]);

		if (result.length === 0) {
			return { deletedCount: 0, deletedCommentIds: [] };
		}

		// Tạo danh sách tất cả comment cần xóa (bao gồm comment gốc và tất cả con, cháu)
		const allCommentIds = [new Types.ObjectId(commentId), ...result[0].descendantIds];

		// Xóa tất cả comment trong 1 lần query
		const deleteResult = await this.commentModel.deleteMany({
			_id: { $in: allCommentIds },
		});

		return {
			deletedCount: deleteResult.deletedCount || 0,
			deletedCommentIds: allCommentIds.map(id => id.toString()),
		};
	}
}
