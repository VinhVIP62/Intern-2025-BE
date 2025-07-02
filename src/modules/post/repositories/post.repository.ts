import { Injectable } from '@nestjs/common';
import { Post } from '../entities/post.schema';
import { ReactType } from '@common/enum/react.type.enum';

@Injectable()
export abstract class IPostRepository {
	abstract create(post: Partial<Post>): Promise<Post>;
	abstract findByUserId(userId: string): Promise<Post[]>;
	abstract updateReactCount(postId: string, type: ReactType, inc: number): Promise<Post | null>;
	abstract updatePost(postId: string, newpost: Partial<Post>): Promise<Post | null>;
	abstract findById(postId: string): Promise<Post | null>;
	abstract findByUserIds_InfiniteScroll(
		limit: number,
		userId: string[],
		updatedBefore?: string,
	): Promise<Post[]>;
	abstract findByExcludingUserIds_InfiniteScroll(
		limit: number,
		userIds: string[],
		updatedBefore?: string,
	): Promise<Post[]>;
}
