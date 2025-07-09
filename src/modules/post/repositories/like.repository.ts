import { TargetType } from '@common/enum/target-type.enum';
import { Like, LikeDocument } from '../entities/like.schema';
import { Types } from 'mongoose';

export abstract class ILikeRepository {
	abstract findOne(condition: Partial<Like>): Promise<LikeDocument | null>;
	abstract create(likeData: Partial<Like>): Promise<LikeDocument>;
	abstract deleteById(id: Types.ObjectId): Promise<void>;

	abstract findByTargetIdWithPagination(params: {
		targetId: string;
		targetType: TargetType;
		page: number;
		limit: number;
	}): Promise<{ data: Like[]; total: number }>;

	abstract findIsLiked(
		userId: string,
		targetIds: string[],
		targetType: TargetType,
	): Promise<string[]>;

	abstract deleteManyByTargetIds(targetIds: string[], targetType: TargetType): Promise<void>;
}
