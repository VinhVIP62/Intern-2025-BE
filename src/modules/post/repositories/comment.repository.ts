import { CreateCommentDto } from '../dto/create-comment.dto';
import { Comment } from '../entities/comment.schema';

export abstract class ICommentRepository {
	abstract create(comment: CreateCommentDto, parentCommentId: string | null): Promise<Comment>;

	abstract findById(id: string): Promise<Comment | null>;

	abstract findAll(): Promise<Comment[]>;

	abstract findByPostId(postId: string): Promise<Comment[]>;

	abstract update(id: string, comment: Partial<Comment>): Promise<Comment | null>;

	abstract delete(userId: string, postId: string, id: string): Promise<Comment>;

	abstract deleteAllByPostId(postId: string): Promise<void>;

	abstract showMoreComment(postId: string, commentId: string): Promise<Comment[]>;

	abstract getCommentCountByPostId(postId: string): Promise<number>;
}
