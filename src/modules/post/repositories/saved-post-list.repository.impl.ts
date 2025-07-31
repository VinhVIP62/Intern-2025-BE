import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ISavedPostListRepository } from './saved-post-list.repository';
import { SavedPostList, SavedPostListDocument } from '../entities/saved-post-list.schema';

@Injectable()
export class SavedPostListRepositoryImpl implements ISavedPostListRepository {
	constructor(
		@InjectModel(SavedPostList.name)
		private readonly model: Model<SavedPostListDocument>,
	) {}

	async create(data: Partial<SavedPostList>): Promise<SavedPostListDocument> {
		const created = new this.model(data);
		return await created.save();
	}

	async findByUserAndName(userId: string, name: string): Promise<SavedPostListDocument | null> {
		return await this.model.findOne({ userId: new Types.ObjectId(userId), name }).exec();
	}

	async findAllByUserIdWithPagination(
		userId: string,
		page = 1,
		limit = 10,
	): Promise<{ data: SavedPostListDocument[]; total: number }> {
		const filter = { userId: new Types.ObjectId(userId) };

		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([
			this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
			this.model.countDocuments(filter).exec(),
		]);

		return { data, total };
	}

	async findById(id: string): Promise<SavedPostList | null> {
		return await this.model.findById(id).exec();
	}

	async deleteById(id: string): Promise<void> {
		await this.model.deleteOne({ _id: new Types.ObjectId(id) }).exec();
	}
}
