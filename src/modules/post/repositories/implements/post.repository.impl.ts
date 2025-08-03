import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../entities/post.schema';
import { Model } from 'mongoose';
import { IPostRepository } from '../interfaces/post.repository';
import { ReactType } from '@common/enum/post/react.type.enum';
import { FilterQuery } from 'mongoose';
import { PostState } from '@common/enum/post/post.state.enum';

@Injectable()
export class PostRepositoryImpl implements IPostRepository {
	constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

	async create(post: Partial<Post>): Promise<Post> {
		return await this.postModel.create(post);
	}

	async updatePost(postId: string, newpost: Partial<Post>): Promise<Post | null> {
		return await this.postModel
			.findOneAndUpdate({ id: postId }, newpost, { new: true, runValidators: true })
			.exec();
	}

	async findById(postId: string): Promise<Post | null> {
		return this.postModel.findOne({ id: postId, isDeleted: false }).exec();
	}

	async findByUserId(
		userId: string,
		state: PostState[],
		limit: number,
		updatedBefore: Date,
	): Promise<Post[]> {
		const query: FilterQuery<Post> = {
			userId,
			isDeleted: false,
			state: { $in: state },
		};
		if (updatedBefore) {
			query.updatedAt = { $lt: updatedBefore };
		}
		return await this.postModel.find(query).sort({ createdAt: -1 }).limit(limit).exec();
	}
	async updateReactCount(postId: string, type: ReactType, inc: number) {
		return await this.postModel
			.findOneAndUpdate(
				{ id: postId },
				{ $inc: { [`reactsCount.${type}`]: inc } },
				{ new: true }, // trả về document đã được cập nhật
			)
			.exec();
	}

	async findByUserIds_InfiniteScroll(
		limit = 10,
		userIds: string[],
		updatedBefore?: string,
	): Promise<Post[]> {
		const query: FilterQuery<Post> = {
			userId: { $in: userIds },
			state: { $in: ['public', 'friend'] },
			isDeleted: false,
		};
		if (updatedBefore) query.updatedAt = { $lt: new Date(updatedBefore) };
		return this.postModel
			.find(query)
			.sort({ updatedAt: -1 }) // giảm dần theo thời gian
			.limit(limit)
			.exec();
	}

	async findByExcludingUserIds_InfiniteScroll(
		limit: number,
		userIds: string[],
		updatedBefore?: string,
	): Promise<Post[]> {
		const query: FilterQuery<Post> = {
			userId: { $nin: userIds },
			state: { $in: ['public'] },
			isDeleted: false,
		};
		if (updatedBefore) query.updatedAt = { $lt: new Date(updatedBefore) };
		return this.postModel
			.find(query)
			.sort({ updatedAt: -1 }) // giảm dần theo thời gian
			.limit(limit)
			.exec();
	}

	async findAll(): Promise<Post[]> {
		return this.postModel.find({ isDeleted: false }).exec();
	}

	async getPostSortByReportCount(
		limit: number,
		page: number,
	): Promise<{
		total: number;
		page: number;
		limit: number;
		items: any[];
	}> {
		if (limit <= 0 || page < 0) {
			throw new Error('Invalid limit or page number');
		}

		const total = await this.postModel.countDocuments({ reportCount: { $gt: -1 } });

		const skip = limit * page;

		const items = await this.postModel
			.aggregate([
				{
					$sort: { reportCount: -1 },
				},
				{
					$skip: skip,
				},
				{
					$limit: limit,
				},
				{
					$lookup: {
						as: 'profile',
						from: 'profiles',
						foreignField: 'userId',
						localField: 'userId',
					},
				},
				{
					$unwind: {
						path: '$profile',
					},
				},
				{
					$project: {
						_id: 0,
						id: 1,
						userId: 1,
						title: 1,
						content: 1,
						state: 1,
						mediaUrls: 1,
						reportCount: 1,
						firstName: '$profile.firstName',
						lastName: '$profile.lastName',
						nickname: '$profile.nickname',
						avatarUrl: '$profile.avatarUrl',
						gender: '$profile.gender',
						birthday: '$profile.birthday',
					},
				},
			])
			.exec();

		return {
			total,
			page,
			limit,
			items,
		};
	}

	getDeletedPosts(
		limit: number,
		page: number,
	): Promise<{ total: number; page: number; limit: number; items: Post[] }> {
		if (limit <= 0 || page < 0) {
			throw new Error('Invalid limit or page number');
		}

		const total = this.postModel.countDocuments({ isDeleted: true });

		const skip = limit * page;

		const items = this.postModel
			.find({ isDeleted: true })
			.sort({ updatedAt: 1 })
			.skip(skip)
			.limit(limit)
			.exec();

		return Promise.all([total, items]).then(([totalCount, items]) => ({
			total: totalCount,
			page,
			limit,
			items,
		}));
	}
}
