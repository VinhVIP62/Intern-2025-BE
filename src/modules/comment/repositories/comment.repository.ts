import { Types } from 'mongoose';
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

export interface ICommentRepository {
	// Post operations
	findPostById(postId: string): Promise<Post | null>;
	updatePostCommentCount(postId: string, increment: number): Promise<void>;

	// Comment CRUD operations
	createComment(commentData: {
		postId: Types.ObjectId;
		author: Types.ObjectId;
		content: string;
		parentId?: Types.ObjectId | null;
	}): Promise<Comment>;

	findCommentById(commentId: string): Promise<Comment | null>;

	findCommentsByPostId(postId: string): Promise<Comment[]>;

	updateComment(commentId: string, updateData: UpdateCommentDto): Promise<Comment | null>;

	softDeleteComment(commentId: string): Promise<void>;

	deleteCommentsByPostId(postId: string): Promise<number>;

	// Reply operations
	updateCommentReplyCount(commentId: string, increment: number): Promise<void>;

	// Visibility operations
	updateCommentVisibility(commentId: string, isHidden: boolean): Promise<Comment | null>;

	// Like operations
	likeComment(commentId: string, userId: Types.ObjectId): Promise<Comment>;
	unlikeComment(commentId: string, userId: Types.ObjectId): Promise<Comment>;

	// Tagged users operations
	tagUsers(commentId: string, userIds: Types.ObjectId[]): Promise<Comment>;
	updateTaggedUsers(commentId: string, userIds: Types.ObjectId[]): Promise<Comment>;

	// Hard delete comment and all descendants
	deleteCommentAndDescendants(
		commentId: string,
	): Promise<{ deletedCount: number; deletedCommentIds: string[] }>;

	// Pagination
	getPaginatedComments(
		postId: string,
		page: number,
		limit: number,
	): Promise<PaginatedCommentsResponseDto>;
}

export const ICommentRepository = Symbol('ICommentRepository');
