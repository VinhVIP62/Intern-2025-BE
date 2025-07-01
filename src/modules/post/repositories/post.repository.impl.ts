import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from '../entities/post.schema';
import { IPostRepository } from './post.repository';
import { PostStatus } from '../entities/post.enum';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';

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
		userId: string,
		sport?: string,
	): Promise<{ posts: Post[]; total: number }> {
		const skip = (page - 1) * limit;
		const filter: any = { approvalStatus: PostStatus.APPROVED };

		if (userId) {
			filter.author = new Types.ObjectId(userId);
		}

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

	async update(
		postId: string,
		updateData: UpdatePostDto,
		images: string[] = [],
		video?: string,
	): Promise<Post> {
		const updateFields: any = { ...updateData };

		// Only update images/video if provided
		if (images.length > 0) {
			updateFields.images = images;
		}
		if (video !== undefined) {
			updateFields.video = video;
		}

		const post = await this.postModel
			.findByIdAndUpdate(postId, updateFields, { new: true, runValidators: true })
			.populate('authorUser', 'username email avatar')
			.populate('event', 'title description')
			.populate('group', 'name description')
			.populate('sharedFromPost', 'content author')
			.populate('comments');

		if (!post) {
			throw new Error('Post not found');
		}

		return post;
	}

	async delete(postId: string): Promise<void> {
		const result = await this.postModel.findByIdAndDelete(postId);
		if (!result) {
			throw new Error('Post not found');
		}
	}

	async checkOwnership(postId: string, userId: string): Promise<boolean> {
		const post = await this.postModel.findById(postId).select('author');
		if (!post) {
			throw new Error('Post not found');
		}
		return post.author.toString() === userId;
	}

	async findTrendingHashtags(
		page: number,
		limit: number,
		timeRange?: string,
	): Promise<{
		hashtags: Array<{ hashtag: string; postCount: number; usageCount: number }>;
		total: number;
	}> {
		const skip = (page - 1) * limit;

		// Build date filter based on timeRange
		let dateFilter: any = {};
		if (timeRange && timeRange !== 'all') {
			const now = new Date();
			let daysAgo: number;

			switch (timeRange) {
				case '7d':
					daysAgo = 7;
					break;
				case '30d':
					daysAgo = 30;
					break;
				case '90d':
					daysAgo = 90;
					break;
				default:
					daysAgo = 7; // Default to 7 days
			}

			const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
			dateFilter = { createdAt: { $gte: startDate } };
		}

		// Aggregate to get trending hashtags
		const pipeline: any[] = [
			{ $match: { approvalStatus: PostStatus.APPROVED, ...dateFilter } },
			{ $unwind: '$hashtags' },
			{
				$group: {
					_id: '$hashtags',
					postCount: { $addToSet: '$_id' },
					usageCount: { $sum: 1 },
				},
			},
			{
				$project: {
					hashtag: '$_id',
					postCount: { $size: '$postCount' },
					usageCount: 1,
				},
			},
			{ $sort: { usageCount: -1, postCount: -1 } },
			{ $skip: skip },
			{ $limit: limit },
		];

		const countPipeline: any[] = [
			{ $match: { approvalStatus: PostStatus.APPROVED, ...dateFilter } },
			{ $unwind: '$hashtags' },
			{ $group: { _id: '$hashtags' } },
			{ $count: 'total' },
		];

		const [hashtags, totalResult] = await Promise.all([
			this.postModel.aggregate(pipeline),
			this.postModel.aggregate(countPipeline),
		]);

		const total = totalResult.length > 0 ? totalResult[0].total : 0;

		return {
			hashtags: hashtags.map(item => ({
				hashtag: item.hashtag,
				postCount: item.postCount,
				usageCount: item.usageCount,
			})),
			total,
		};
	}

	async findPostsByHashtag(
		hashtag: string,
		page: number,
		limit: number,
	): Promise<{ posts: Post[]; total: number }> {
		const skip = (page - 1) * limit;

		// Ensure hashtag starts with #
		if (!hashtag.startsWith('#')) {
			hashtag = `#${hashtag}`;
		}

		const filter = {
			approvalStatus: PostStatus.APPROVED,
			hashtags: hashtag,
		};

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

	async replaceTaggedUsers(postId: string, userIds: string[]): Promise<Post> {
		const post = await this.postModel.findByIdAndUpdate(
			postId,
			{ $set: { taggedUsers: userIds } },
			{ new: true },
		);
		if (!post) throw new Error('Post not found');
		return post;
	}

	async likePost(postId: string, userId: string): Promise<Post> {
		const post = await this.postModel
			.findOneAndUpdate(
				{ _id: postId, likes: { $ne: userId } },
				{ $addToSet: { likes: userId }, $inc: { likeCount: 1 } },
				{ new: true },
			)
			.populate('authorUser', 'username email avatar');
		if (!post) throw new Error('Already liked or post not found');
		return post;
	}

	async unlikePost(postId: string, userId: string): Promise<Post> {
		const post = await this.postModel
			.findOneAndUpdate(
				{ _id: postId, likes: userId },
				{ $pull: { likes: userId }, $inc: { likeCount: -1 } },
				{ new: true },
			)
			.populate('authorUser', 'username email avatar');
		if (!post) throw new Error('Not liked or post not found');
		return post;
	}

	async getPostLikes(postId: string): Promise<{ likes: string[]; likeCount: number }> {
		const post = await this.postModel.findById(postId).select('likes likeCount');
		if (!post) throw new Error('Post not found');
		return { likes: post.likes.map((id: any) => id.toString()), likeCount: post.likeCount };
	}
}
