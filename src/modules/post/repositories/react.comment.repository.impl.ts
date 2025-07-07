import { Injectable } from '@nestjs/common';
import { IReactCommentRepository } from './react.comment.repository';
import { ReactType } from '@common/enum/react.type.enum';
import { InjectModel } from '@nestjs/mongoose';
import { ReactComment } from '../entities/react.comment.schema';
import { Model } from 'mongoose';

@Injectable()
export class ReactCommentRepositoryImpl implements IReactCommentRepository {
	constructor(
		@InjectModel(ReactComment.name)
		private readonly reactcmtModel: Model<ReactComment>,
	) {}
	async reactComment(userId: string, cmtId: string, type: ReactType) {
		return this.reactcmtModel.create({ userId: userId, commentId: cmtId, type: type });
	}
	async unReactComment(userId: string, cmtId: string) {
		return this.reactcmtModel.findOneAndDelete({ userId: userId, commentId: cmtId });
	}
	async isReacted(userId: string, cmtId: string) {
		const existed = await this.reactcmtModel.exists({ userId, commentId: cmtId });
		return !!existed;
	}
}
