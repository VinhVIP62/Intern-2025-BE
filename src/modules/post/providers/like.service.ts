import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { CreateLikeDto } from '../dto/create-like.dto';
import { ILikeRepository } from '../repositories/like.repository';
import { ResponseLikeDto } from '../dto/response-like.dto';
import { TargetType } from '@common/enum/target-type.enum';
import { IPostRepository } from '../repositories/post.repository';
import { ICommentRepository } from '../repositories/comment.repository';

@Injectable()
export class LikeService {
	constructor(
		private readonly likeRepository: ILikeRepository,
		private readonly postRepository: IPostRepository,
		private readonly commentRepository: ICommentRepository,
	) {}

	async createOrUpdateLike(userId: string, dto: CreateLikeDto): Promise<ResponseLikeDto | null> {
		const existing = await this.likeRepository.findOne({
			author: new Types.ObjectId(userId),
			targetId: new Types.ObjectId(dto.targetId),
			targetType: dto.targetType,
		});

		if (existing) {
			// Unlike
			await this.likeRepository.deleteById(existing._id);

			if (dto.targetType === TargetType.Post) {
				await this.postRepository.updateLikeCount(dto.targetId, -1);
			} else {
				await this.commentRepository.updateLikeCount(dto.targetId, -1);
			}

			return null;
		}

		// Like mới
		const like = await this.likeRepository.create({
			author: new Types.ObjectId(userId),
			targetId: new Types.ObjectId(dto.targetId),
			targetType: dto.targetType,
		});

		if (dto.targetType === TargetType.Post) {
			await this.postRepository.updateLikeCount(dto.targetId, 1);
		} else {
			await this.commentRepository.updateLikeCount(dto.targetId, 1);
		}

		return plainToInstance(ResponseLikeDto, like, {
			excludeExtraneousValues: true,
		});
	}

	async getLikesByTarget(
		targetId: string,
		targetType: TargetType,
		query: { page?: string; limit?: string },
	) {
		const page = parseInt(query.page || '1', 10);
		const limit = parseInt(query.limit || '10', 10);

		const { data, total } = await this.likeRepository.findByTargetIdWithPagination({
			targetId,
			targetType,
			page,
			limit,
		});

		return {
			items: plainToInstance(ResponseLikeDto, data, {
				excludeExtraneousValues: true,
			}),
			meta: { total, page, limit },
		};
	}
}
