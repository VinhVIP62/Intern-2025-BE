import { Injectable } from '@nestjs/common';
import { ICommentRepository } from '../interfaces/comment.repository';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Comment } from '../../entities/comment.schema';
import { ReactType } from '@common/enum/post/react.type.enum';

@Injectable()
export class CommentRepositoryImpl implements ICommentRepository {
	constructor(@InjectModel(Comment.name) private readonly commentModel: Model<Comment>) {}

	async create(comment: Partial<Comment>) {
		return this.commentModel.create(comment);
	}

	async findByPostId(postId: string, limit: number, before?: Date) {
		const query: FilterQuery<Comment> = { postId: postId, parentId: null };
		if (before) {
			query.createdAt = { $lt: before };
		}
		return this.commentModel.find(query).sort({ createdAt: -1 }).limit(limit).exec();
	}

	async findChildCmt(parentCmtId: string) {
		return this.commentModel.find({ parentId: parentCmtId }).sort({ createAt: -1 }).exec();
	}

	async existParent(parentId: string) {
		const existed = await this.commentModel.exists({ id: parentId });
		return !!existed;
	}

	async childCount(cmtId: string) {
		const childCount = await this.commentModel.countDocuments({ parentId: cmtId });
		return childCount;
	}

	async updateReactCount(cmtId: string, type: ReactType, inc: number) {
		return await this.commentModel
			.findOneAndUpdate(
				{ id: cmtId },
				{ $inc: { [`reactsCount.${type}`]: inc } },
				{ new: true }, // trả về document đã được cập nhật
			)
			.exec();
	}

	async findById(cmtId: string) {
		return this.commentModel.findOne({ id: cmtId });
	}
}
