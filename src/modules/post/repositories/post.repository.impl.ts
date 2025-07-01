import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from '../entities/post.schema';
import { IPostRepository } from './post.repository';
import { PostStatus } from '../entities/post.enum';
import { CreatePostDto } from '../dto/post.dto';

@Injectable()
export class PostRepositoryImpl implements IPostRepository {
	constructor(@InjectModel(Post.name) private readonly postModel: Model<Post>) {}

	async findAll(
		page: number,
		limit: number,
		sport?: string,
		userId?: string,
	): Promise<{ posts: Post[]; total: number }> {
		const skip = (page - 1) * limit;
		const filter: any = {};

		if (sport) {
			filter.sport = sport;
		}

		if (userId) {
			filter.author = new Types.ObjectId(userId);
		}

		const [posts, total] = await Promise.all([
			this.postModel
				.find(filter)
				.populate('authorUser', 'username email avatar')
				.populate('event', 'title description')
				.populate('group', 'name description')
				.populate('sharedFromPost', 'content author')
				.populate('comments')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			this.postModel.countDocuments(filter),
		]);

		return { posts: posts as unknown as Post[], total };
	}

	async findById(postId: string): Promise<Post> {
		const post = await this.postModel
			.findById(postId)
			.populate('authorUser', 'username email avatar')
			.populate('event', 'title description')
			.populate('group', 'name description')
			.populate('sharedFromPost', 'content author')
			.populate('comments')
			.lean();

		if (!post) {
			throw new Error('Post not found');
		}

		return post as unknown as Post;
	}

	async findByUserId(
		userId: string,
		page: number,
		limit: number,
	): Promise<{ posts: Post[]; total: number }> {
		const skip = (page - 1) * limit;
		const filter = { author: new Types.ObjectId(userId) };

		const [posts, total] = await Promise.all([
			this.postModel
				.find(filter)
				.populate('authorUser', 'username email avatar')
				.populate('event', 'title description')
				.populate('group', 'name description')
				.populate('sharedFromPost', 'content author')
				.populate('comments')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			this.postModel.countDocuments(filter),
		]);

		return { posts: posts as unknown as Post[], total };
	}

	async findApprovedPosts(
		page: number,
		limit: number,
		sport?: string,
	): Promise<{ posts: Post[]; total: number }> {
		const skip = (page - 1) * limit;
		const filter: any = { approvalStatus: PostStatus.APPROVED };

		if (sport) {
			filter.sport = sport;
		}

		const [posts, total] = await Promise.all([
			this.postModel
				.find(filter)
				.populate('authorUser', 'username email avatar')
				.populate('event', 'title description')
				.populate('group', 'name description')
				.populate('sharedFromPost', 'content author')
				.populate('comments')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			this.postModel.countDocuments(filter),
		]);

		return { posts: posts as unknown as Post[], total };
	}

	async create(
		postData: CreatePostDto,
		authorId: string,
		images: string[] = [],
		video?: string,
	): Promise<Post> {
		const post = new this.postModel({
			...postData,
			author: new Types.ObjectId(authorId),
			images,
			video,
		});

		return await post.save();
	}
}
