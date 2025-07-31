import { Injectable } from '@nestjs/common';
import { Post, PostDocument } from '../entities/post.schema';
import { Types } from 'mongoose';

@Injectable()
export abstract class IPostRepository {
	abstract findPostsWithPagination(filter: {
		userId?: string;
		viewerId?: string | null;
		page: number;
		limit: number;
		friendIds?: string[];
	}): Promise<{ data: PostDocument[]; total: number }>;

	abstract findManyByIds(
		postIds: Types.ObjectId[],
		viewerId: string | null,
		friendIds: string[],
		blockedUserIds: string[],
	): Promise<PostDocument[]>;

	abstract findDetailById(
		postId: string,
		viewerId: string | null,
		friendIds: string[],
	): Promise<PostDocument | null>;

	abstract findById(postId: string): Promise<PostDocument | null>;

	abstract create(postData: Partial<Post>): Promise<PostDocument>;

	abstract updateById(postId: string, update: Partial<Post>): Promise<Post | null>;

	abstract deleteById(postId: string): Promise<void>;

	abstract updateLikeCount(postId: string, increment: number): Promise<void>;

	abstract updateCommentCount(postId: string, increment: number): Promise<void>;

	abstract getFeedPosts(
		userId: string | null,
		friendIds: string[],
		blockedUserIds: string[],
		page: number,
		groupLimit: number,
	): Promise<{
		data: {
			sharedPost: PostDocument | null;
			sharedPostIsRestricted: boolean;
			posts: PostDocument[];
		}[];
		total: number;
	}>;
}
