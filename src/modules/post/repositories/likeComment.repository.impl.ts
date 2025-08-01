import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LikeComment } from '../entities/likeCmt.schema';
import { ILikeCommentRepository } from './likeComment.repository';

export class LikeCommentRepositoryImpl implements ILikeCommentRepository {
	constructor(@InjectModel(LikeComment.name) private readonly likeCmtModel: Model<LikeComment>) {}
	async findByPostIdAndCommentId(postId: string, commentId: string): Promise<LikeComment | null> {
		return this.likeCmtModel.findOne({ postId, commentId });
	}
	async findByPostIdAndCommentIdAndUserId(
		postId: string,
		commentId: string,
		userId: string,
	): Promise<LikeComment | null> {
		return this.likeCmtModel.findOne({ postId, commentId, userId });
	}
	async create(likeCmt: LikeComment): Promise<LikeComment> {
		return this.likeCmtModel.create(likeCmt);
	}
	async update(id: string, likeCmt: LikeComment): Promise<LikeComment | null> {
		return this.likeCmtModel.findByIdAndUpdate(id, likeCmt, { new: true });
	}
	async delete(id: string): Promise<boolean> {
		const result = await this.likeCmtModel.findByIdAndDelete(id);
		return result !== null;
	}
	async likeComment(
		postId: string,
		commentId: string,
		userId: string,
	): Promise<LikeComment | null> {
		const likeCmt = await this.likeCmtModel.findOne({ postId, commentId });
		if (!likeCmt) {
			return this.likeCmtModel.create({ postId, commentId, userId });
		}
		return this.likeCmtModel.findByIdAndUpdate(
			likeCmt._id,
			{ $addToSet: { likedUserIds: userId } },
			{ new: true, upsert: true },
		);
	}
	async unlikeComment(
		postId: string,
		commentId: string,
		userId: string,
	): Promise<LikeComment | null> {
		const likeCmt = await this.likeCmtModel.findOne({ postId, commentId });
		if (!likeCmt) {
			return null;
		}
		const updatedLikeCmt = await this.likeCmtModel.findByIdAndUpdate(
			likeCmt._id,
			{ $pull: { likedUserIds: userId } },
			{ new: true },
		);
		if (!updatedLikeCmt) {
			return null;
		}
		if (updatedLikeCmt.likedUserIds?.length === 0 && likeCmt._id) {
			await this.delete(likeCmt._id.toString());
			return updatedLikeCmt;
		}
		return updatedLikeCmt;
	}
}
