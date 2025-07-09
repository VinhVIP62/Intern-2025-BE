import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument } from '../entities/like.schema';
import { Model, Types } from 'mongoose';
import { ILikeRepository } from './like.repository';
import { TargetType } from '@common/enum/target-type.enum';

@Injectable()
export class LikeRepositoryImpl implements ILikeRepository {
	constructor(@InjectModel(Like.name) private readonly likeModel: Model<LikeDocument>) {}

	async findOne(condition: Partial<Like>): Promise<LikeDocument | null> {
		return this.likeModel.findOne(condition).populate('author', '_id fullName avatarUrl').exec();
	}

	async create(likeData: Partial<Like>): Promise<LikeDocument> {
		const created = new this.likeModel(likeData);
		return created.save();
	}

	async deleteById(id: Types.ObjectId): Promise<void> {
		await this.likeModel.findByIdAndDelete(id).exec();
	}

	async findByTargetIdWithPagination(params: {
		targetId: string;
		targetType: TargetType;
		page: number;
		limit: number;
	}): Promise<{ data: Like[]; total: number }> {
		const { targetId, targetType, page, limit } = params;

		const filter = {
			targetId: new Types.ObjectId(targetId),
			targetType,
		};

		const [data, total] = await Promise.all([
			this.likeModel
				.find(filter)
				.sort({ createdAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.populate('author', '_id fullName avatarUrl')
				.exec(),
			this.likeModel.countDocuments(filter),
		]);

		return { data, total };
	}

	async findIsLiked(
		userId: string,
		targetIds: string[],
		targetType: TargetType,
	): Promise<string[]> {
		const likes = await this.likeModel
			.find({
				author: new Types.ObjectId(userId),
				targetId: { $in: targetIds.map(id => new Types.ObjectId(id)) },
				targetType: targetType,
			})
			.select('targetId')
			.lean();

		return likes.map(like => like.targetId.toString());
	}

	async deleteManyByTargetIds(targetIds: string[], targetType: TargetType): Promise<void> {
		await this.likeModel
			.deleteMany({
				targetId: { $in: targetIds.map(id => new Types.ObjectId(id)) },
				targetType,
			})
			.exec();
	}
}
