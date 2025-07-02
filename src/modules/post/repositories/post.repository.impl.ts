import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../entities/post.schema';
import { Model } from 'mongoose';
import { IPostRepository } from './post.repository';
import { ReactType } from '@common/enum/react.type.enum';
import { FilterQuery } from 'mongoose';

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
		return this.postModel.findOne({ id: postId }).exec();
	}

	async findByUserId(userId: string): Promise<Post[]> {
		return await this.postModel.find({ userId }).sort({ createdAt: -1 }).exec();
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
		const query: FilterQuery<Post> = { userId: { $in: userIds } };
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
		const query: FilterQuery<Post> = { userId: { $nin: userIds } };
		if (updatedBefore) query.updatedAt = { $lt: new Date(updatedBefore) };
		return this.postModel
			.find(query)
			.sort({ updatedAt: -1 }) // giảm dần theo thời gian
			.limit(limit)
			.exec();
	}
}
