import { InjectModel } from '@nestjs/mongoose';
import { IPostRepository } from './post.repository';
import { Post } from '../entities/post.schema';
import { FilterQuery, Model } from 'mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostQueryDto } from '../dto/post-query.dto';

export class PostRepositoryImpl implements IPostRepository {
	constructor(@InjectModel(Post.name) private readonly postModel: Model<Post>) {}
	async create(post: CreatePostDto): Promise<Post> {
		return await this.postModel.create(post);
	}
	async findById(id: string): Promise<Post | null> {
		return this.postModel.findById(id);
	}
	async findAll(): Promise<Post[]> {
		return this.postModel.find();
	}
	async findByUserId(userId: string): Promise<Post[]> {
		return this.postModel.find({ userId });
	}
	async update(id: string, post: UpdatePostDto): Promise<Post | null> {
		return await this.postModel.findByIdAndUpdate(id, post, { new: true });
	}
	async delete(id: string): Promise<Post | null> {
		return await this.postModel.findByIdAndDelete(id);
	}
	async findAllWithPagination(postQuery: PostQueryDto): Promise<{ posts: Post[]; total: number }> {
		const { userId, page, limit, sortBy, sortOrder } = postQuery;
		const query: FilterQuery<Post> = {};
		if (userId) {
			query.userId = userId;
		}
		const skip = (page ? page - 1 : 0) * (limit ? limit : 10);
		const sortField = sortBy === 'createdAt' ? 'createdAt' : 'content';
		const sortWithOrder = sortOrder === 'asc' ? 1 : -1;
		const limited = limit ? limit : 10;

		const [posts, total] = await Promise.all([
			this.postModel
				.find(query)
				.sort({ [sortField]: sortWithOrder })
				.skip(skip)
				.limit(limited)
				.exec(),
			this.postModel.countDocuments(query).exec(),
		]);
		return { posts, total };
	}
	async likePost(userId: string, postId: string): Promise<Post | null> {
		try {
			const likedPost = await this.postModel.findByIdAndUpdate(
				postId,
				{
					$push: { likedUserIds: userId },
				},
				{ new: true },
			);
			return likedPost;
		} catch (error) {
			throw new Error('Failed to like post');
		}
	}
	async unlikePost(userId: string, post: Post): Promise<Post | null> {
		try {
			//remove user from likedUserIds
			const likedPost = await this.postModel.findByIdAndUpdate(
				post._id.toString(),
				{ $pull: { likedUserIds: userId } },
				{ new: true },
			);
			return likedPost;
		} catch (error) {
			throw new Error('Failed to unlike post');
		}
	}
	async search(query: string): Promise<Post[]> {
		if (!query || query.trim() === '') return [];
		// console.log('Post Repository - Received query:', query);
		//check case public, private, friends, do later
		const result = this.postModel.find({
			$or: [
				{ title: { $regex: query, $options: 'i' } },
				{ content: { $regex: query, $options: 'i' } },
			],
		});

		return result;
	}
}
