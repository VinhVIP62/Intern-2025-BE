import { LikeComment } from '../entities/likeCmt.schema';

export abstract class ILikeCommentRepository {
	abstract findByPostIdAndCommentId(postId: string, commentId: string): Promise<LikeComment | null>;
	abstract findByPostIdAndCommentIdAndUserId(
		postId: string,
		commentId: string,
		userId: string,
	): Promise<LikeComment | null>;
	abstract create(likeCmt: LikeComment): Promise<LikeComment>;
	abstract update(id: string, likeCmt: LikeComment): Promise<LikeComment | null>;
	abstract delete(id: string): Promise<boolean>;
	abstract likeComment(
		postId: string,
		commentId: string,
		userId: string,
	): Promise<LikeComment | null>;
	abstract unlikeComment(
		postId: string,
		commentId: string,
		userId: string,
	): Promise<LikeComment | null>;
}
