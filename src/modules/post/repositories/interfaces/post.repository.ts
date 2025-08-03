import { Injectable } from '@nestjs/common';
import { Post } from '../../entities/post.schema';
import { ReactType } from '@common/enum/post/react.type.enum';
import { PostState } from '@common/enum/post/post.state.enum';

@Injectable()
export abstract class IPostRepository {
	abstract findAll(): Promise<Post[]>;
	abstract create(post: Partial<Post>): Promise<Post>;
	abstract findByUserId(
		userId: string,
		state: PostState[],
		limit: number,
		updatedBefore?: Date,
	): Promise<Post[]>;
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
	abstract getPostSortByReportCount(
		limit: number,
		page: number,
	): Promise<{
		total: number;
		page: number;
		limit: number;
		items: Post[];
	}>;
	abstract getDeletedPosts(
		limit: number,
		page: number,
	): Promise<{
		total: number;
		page: number;
		limit: number;
		items: Post[];
	}>;
}
