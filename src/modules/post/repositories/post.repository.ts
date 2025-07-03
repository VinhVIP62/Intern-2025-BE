import { Post } from '../entities/post.schema';
import { Types } from 'mongoose';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';
import { PostAccessLevel } from '../entities/post.enum';
export interface IPostRepository {
	findAll(
		page: number,
		limit: number,
		sport?: string,
		userId?: string,
		accessLevel?: PostAccessLevel,
	): Promise<{ posts: Post[]; total: number }>;

	findById(postId: string): Promise<Post>;

	findByUserIdAndAccessLevels(
		userId: string,
		page: number,
		limit: number,
		accessLevels: PostAccessLevel[],
	): Promise<{ posts: Post[]; total: number }>;

	findApprovedPosts(
		page: number,
		limit: number,
		userId: string,
		accessLevel?: PostAccessLevel,
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
		accessLevels: PostAccessLevel[],
	): Promise<{ posts: Post[]; total: number }>;

	replaceTaggedUsers(postId: string, userIds: string[]): Promise<Post>;

	likePost(postId: string, userId: string): Promise<Post>;
	unlikePost(postId: string, userId: string): Promise<Post>;
	getPostLikes(postId: string): Promise<{ likes: string[]; likeCount: number }>;

	findNewsfeedByAccessLevels(
		page: number,
		limit: number,
		userId: string,
		accessLevels: PostAccessLevel[],
		sport?: string,
	): Promise<{ posts: Post[]; total: number }>;

	findAllByAccessLevels(
		page: number,
		limit: number,
		sport?: string,
		userId?: string,
		accessLevels?: PostAccessLevel[],
	): Promise<{ posts: Post[]; total: number }>;

	findTrendingPosts(
		page: number,
		limit: number,
		sport?: string,
		userId?: string,
		accessLevels?: PostAccessLevel[],
		timeRange?: string,
	): Promise<{ posts: Post[]; total: number }>;

	clearUrl(postId: string, isClearImage: boolean, isClearVideo: boolean): Promise<void>;
}

export const IPostRepository = Symbol('IPostRepository');
