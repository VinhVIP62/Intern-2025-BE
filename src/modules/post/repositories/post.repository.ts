import { Post } from '../entities/post.schema';
import { Types } from 'mongoose';
import { CreatePostDto } from '../dto/post.dto';

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
}

export const IPostRepository = Symbol('IPostRepository');
