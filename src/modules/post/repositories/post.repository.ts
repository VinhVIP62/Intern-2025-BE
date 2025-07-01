import { Post } from '../entities/post.schema';
import { Types } from 'mongoose';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';

export interface IPostRepository {
	findAll(
		page: number,
		limit: number,
		sport?: string,
		userId?: string,
	): Promise<{ posts: Post[]; total: number }>;

	findById(postId: string): Promise<Post>;

	findByUserId(
		userId: string,
		page: number,
		limit: number,
	): Promise<{ posts: Post[]; total: number }>;

	findApprovedPosts(
		page: number,
		limit: number,
		sport?: string,
	): Promise<{ posts: Post[]; total: number }>;

	create(
		postData: CreatePostDto,
		authorId: string,
		images?: string[],
		video?: string,
	): Promise<Post>;

	update(
		postId: string,
		updateData: UpdatePostDto,
		images?: string[],
		video?: string,
	): Promise<Post>;

	delete(postId: string): Promise<void>;

	checkOwnership(postId: string, userId: string): Promise<boolean>;

	findTrendingHashtags(
		page: number,
		limit: number,
		timeRange?: string,
	): Promise<{
		hashtags: Array<{ hashtag: string; postCount: number; usageCount: number }>;
		total: number;
	}>;

	findPostsByHashtag(
		hashtag: string,
		page: number,
		limit: number,
	): Promise<{ posts: Post[]; total: number }>;
}

export const IPostRepository = Symbol('IPostRepository');
