import { Comment, CommentDocument } from '../entities/comment.schema';

export abstract class ICommentRepository {
	abstract findById(id: string): Promise<Comment | null>;
	abstract create(comment: Partial<Comment>): Promise<Comment>;
	abstract findByPostIdWithPagination(params: {
		postId: string;
		parentCommentId: string | null;
		page: number;
		limit: number;
	}): Promise<{ data: CommentDocument[]; total: number }>;

	abstract updateLikeCount(commentId: string, increment: number): Promise<void>;
	abstract updateCommentCount(commentId: string, increment: number): Promise<void>;
	abstract findAllByPostId(postId: string): Promise<CommentDocument[]>;
	abstract deleteManyByIds(commentIds: string[]): Promise<void>;
}
