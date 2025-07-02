import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { React } from '../entities/react.post.schema';
import { Model } from 'mongoose';
import { IReactRepository } from './react.repository';
import { ReactType } from '@common/enum/react.type.enum';

@Injectable()
export class ReactRepositoryImpl implements IReactRepository {
	constructor(
		@InjectModel(React.name)
		private readonly reactModel: Model<React>,
	) {}

	async reactPost(userId: string, postId: string, type: ReactType): Promise<React> {
		return this.reactModel.create({ userId, postId, type });
	}

	async unReactPost(userId: string, postId: string): Promise<React | null> {
		return this.reactModel.findOneAndDelete({ userId: userId, postId: postId });
	}

	async isReacted(userId: string, postId: string): Promise<boolean> {
		const existed = await this.reactModel.exists({ userId, postId });
		return !!existed;
	}
}
