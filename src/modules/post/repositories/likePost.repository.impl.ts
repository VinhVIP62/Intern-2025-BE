import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LikePost, LikePostDocument } from '../entities/likePost.schema';
import { ILikePostRepository } from './likePost.repository';
import { LikePostPaginationDto } from '../dto/response/likePost.pagination.dto';

export class LikePostRepositoryImpl implements ILikePostRepository {
	constructor(
		@InjectModel(LikePost.name) private readonly likePostModel: Model<LikePostDocument>,
	) {}
	async findByPostId(postId: string): Promise<LikePostDocument | null> {
		const likePost = await this.likePostModel.findOne({ postId });
		if (!likePost) {
			return null;
		}
		return likePost;
	}
	async findByPostIdAndUserId(postId: string, userId: string): Promise<LikePostDocument | null> {
		const likePost = await this.findByPostId(postId);
		if (!likePost) {
			return null;
		}
		if (likePost.likeUserIds?.includes(userId)) {
			return likePost;
		}
		return null;
	}
	async create(likePost: LikePost): Promise<LikePostDocument> {
		return this.likePostModel.create(likePost);
	}
	async update(id: string, likePost: LikePost): Promise<LikePostDocument | null> {
		const updatedLikePost = await this.likePostModel.findByIdAndUpdate(id, likePost, { new: true });
		if (!updatedLikePost) {
			return null;
		}
		return updatedLikePost;
	}
	async delete(id: string): Promise<boolean> {
		const result = await this.likePostModel.findOneAndDelete({ postId: id });
		return result !== null;
	}
	async likePost(postId: string, userId: string): Promise<LikePostDocument | null> {
		const existingLike = await this.findByPostId(postId);
		if (!existingLike) {
			return await this.create({ postId, likeUserIds: [userId] });
		}
		return await this.likePostModel.findOneAndUpdate(
			{ _id: existingLike._id },
			{ $addToSet: { likeUserIds: userId } },
			{ new: true },
		);
	}
	async unlikePost(postId: string, userId: string): Promise<LikePostDocument | null> {
		//update post like count
		const existingLike = await this.findByPostId(postId);
		if (!existingLike) {
			return null;
		}
		const updatedLikePost = await this.likePostModel.findOneAndUpdate(
			{ _id: existingLike._id },
			{ $pull: { likeUserIds: userId } },
			{ new: true },
		);
		if (!updatedLikePost) {
			console.log('updatedLikePost is null');
			return null;
		}
		console.log('length', updatedLikePost.likeUserIds?.length);
		if (updatedLikePost.likeUserIds?.length === 0) {
			await this.delete(postId);
			return updatedLikePost;
		}
		return updatedLikePost;
	}
	async getUserLikedPosts(
		postId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<LikePostPaginationDto> {
		const skip = (page - 1) * limit;
		const posts = await this.likePostModel
			.findOne({ postId })
			.select('likeUserIds')
			.skip(skip)
			.limit(limit)
			.exec();
		const total = posts?.likeUserIds?.length || 0;
		// console.log(posts?.likeUserIds);
		const totalPages = Math.ceil(total / limit);
		const hasNextPage = page < totalPages;
		const hasPreviousPage = page > 1;
		return {
			users: posts?.likeUserIds || [],
			pagination: {
				total,
				page,
				limit,
				totalPages,
				hasNextPage,
				hasPreviousPage,
			},
		};
	}
}
