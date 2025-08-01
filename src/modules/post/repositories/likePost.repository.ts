import { LikePostPaginationDto } from '../dto/response/likePost.pagination.dto';
import { LikePost, LikePostDocument } from '../entities/likePost.schema';

export abstract class ILikePostRepository {
	abstract findByPostId(postId: string): Promise<LikePostDocument | null>;
	abstract findByPostIdAndUserId(postId: string, userId: string): Promise<LikePostDocument | null>;
	abstract create(likePost: LikePost): Promise<LikePostDocument>;
	abstract update(id: string, likePost: LikePost): Promise<LikePostDocument | null>;
	abstract delete(id: string): Promise<boolean>;
	abstract likePost(postId: string, userId: string): Promise<LikePostDocument | null>;
	abstract unlikePost(postId: string, userId: string): Promise<LikePostDocument | null>;
	abstract getUserLikedPosts(
		postId: string,
		page: number,
		limit: number,
	): Promise<LikePostPaginationDto>;
}
