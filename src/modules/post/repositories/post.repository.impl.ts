import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from '../entities/post.schema';
import { IPostRepository } from './post.repository';
import { PostVisibility } from '@common/enum/post-visibility.enum';

@Injectable()
export class PostRepositoryImpl implements IPostRepository {
	constructor(@InjectModel(Post.name) private readonly postModel: Model<Post>) {}

	private buildPostVisibilityFilter(
		userId: string | undefined,
		viewerId: string | null | undefined,
		friendIds: string[] = [],
	): any {
		if (!viewerId) return { visibility: PostVisibility.Public };

		const viewerObjectId = new Types.ObjectId(viewerId);

		// Đang xem bài chính mình
		if (!userId || userId === viewerId) {
			return {
				$or: [
					{ visibility: PostVisibility.Public },
					{
						visibility: PostVisibility.Friends,
						author: { $in: friendIds.map(id => new Types.ObjectId(id)) },
					},
					{ author: viewerObjectId },
				],
			};
		}

		// Đang xem người khác
		return {
			$or: [
				{ visibility: PostVisibility.Public },
				{
					visibility: PostVisibility.Friends,
					author: { $in: friendIds.map(id => new Types.ObjectId(id)) },
				}, // 👈 nếu người khác là bạn bè
			],
		};
	}

	async findPostsWithPagination(params: {
		userId?: string;
		viewerId?: string | null;
		page: number;
		limit: number;
		friendIds?: string[];
	}): Promise<{ data: PostDocument[]; total: number }> {
		const { userId, viewerId, page, limit, friendIds } = params;

		const filter: Record<string, unknown> = {};

		if (userId) {
			filter.author = new Types.ObjectId(userId);
		}

		Object.assign(filter, this.buildPostVisibilityFilter(userId, viewerId, friendIds));

		const [data, total] = await Promise.all([
			this.postModel
				.find(filter)
				.sort({ createdAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.populate('author', '_id fullName avatarUrl')
				.exec(),

			this.postModel.countDocuments(filter),
		]);

		return { data, total };
	}

	async findManyByIds(postIds: Types.ObjectId[], viewerId: string | null): Promise<PostDocument[]> {
		if (postIds.length === 0) return [];

		const filter: Record<string, unknown> = {};
		Object.assign(filter, this.buildPostVisibilityFilter(undefined, viewerId));

		const posts = await this.postModel
			.find({
				_id: { $in: postIds },
				...filter,
			})
			.populate('author', '_id fullName avatarUrl')
			.exec();

		// Trả về đúng thứ tự như trong postIds ban đầu (nếu cần)
		const postMap = new Map(posts.map(post => [post._id.toString(), post]));
		return postIds.map(id => postMap.get(id.toString())).filter(Boolean) as PostDocument[];
	}

	async findById(postId: string): Promise<Post | null> {
		return this.postModel.findById(postId).populate('author', '_id fullName avatarUrl').exec();
	}

	async create(postData: Partial<Post>): Promise<PostDocument> {
		const created = new this.postModel(postData);
		return created.save();
	}

	async updateById(postId: string, update: Partial<Post>): Promise<Post | null> {
		return this.postModel
			.findByIdAndUpdate(postId, update, {
				new: true,
			})
			.exec();
	}

	async deleteById(postId: string): Promise<void> {
		await this.postModel.findByIdAndDelete(postId).exec();
	}

	async updateLikeCount(postId: string, increment: number): Promise<void> {
		await this.postModel
			.updateOne({ _id: new Types.ObjectId(postId) }, { $inc: { likeCount: increment } })
			.exec();
	}

	async updateCommentCount(postId: string, increment: number): Promise<void> {
		await this.postModel
			.updateOne({ _id: new Types.ObjectId(postId) }, { $inc: { commentCount: increment } })
			.exec();
	}
}
