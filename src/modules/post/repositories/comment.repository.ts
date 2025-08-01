import { CreateCommentDto } from '../dto/request/create-comment.dto';
import { Comment } from '../entities/comment.schema';
import { CommentResponseDto } from '../dto/response/comment-response.dto';

export abstract class ICommentRepository {
	abstract create(comment: CreateCommentDto, parentCommentId: string | null): Promise<Comment>;

	abstract findById(id: string): Promise<CommentResponseDto | null>;

	abstract findAll(): Promise<CommentResponseDto[]>;

	abstract findByPostId(
		postId: string,
		page: number,
		limit: number,
	): Promise<{
		comments: CommentResponseDto[];
		total: number;
	}>;

	abstract update(id: string, comment: Partial<Comment>): Promise<CommentResponseDto | null>;

	abstract delete(userId: string, postId: string, id: string): Promise<CommentResponseDto>;

	abstract deleteAllByPostId(postId: string): Promise<void>;

	abstract showMoreComment(
		postId: string,
		commentId: string,
		page: number,
		limit: number,
	): Promise<{
		comments: CommentResponseDto[];
		total: number;
	}>;

	abstract findOne(query: any): Promise<CommentResponseDto | null>;

	abstract getCommentCountByPostId(postId: string): Promise<number>;
}
