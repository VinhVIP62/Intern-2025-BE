import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { SavedPostItem, SavedPostItemDocument } from '../entities/saved-post-item.schema';
import { ISavedPostItemRepository } from './saved-post-item.repository';
import { PipelineStage } from 'mongoose';
import { FirstMediaUrlResult } from '../interfaces/media-url.interface';

@Injectable()
export class SavedPostItemRepositoryImpl implements ISavedPostItemRepository {
	constructor(
		@InjectModel(SavedPostItem.name)
		private readonly savedPostItemModel: Model<SavedPostItem>,
	) {}

	async create(data: Partial<SavedPostItem>): Promise<SavedPostItem> {
		const created = new this.savedPostItemModel(data);
		return created.save(); // sẽ throw nếu trùng vì unique index
	}

	async findByListIdWithPagination(
		listId: string,
		page: number,
		limit: number,
	): Promise<{ data: SavedPostItemDocument[]; total: number }> {
		const filter = { listId: new Types.ObjectId(listId) };

		const [data, total] = await Promise.all([
			this.savedPostItemModel
				.find(filter)
				.sort({ savedAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.exec(),
			this.savedPostItemModel.countDocuments(filter),
		]);

		return { data, total };
	}

	async removeFromList(listId: string, postId: string): Promise<void> {
		await this.savedPostItemModel
			.deleteOne({
				listId: new Types.ObjectId(listId),
				post: new Types.ObjectId(postId),
			})
			.exec();
	}

	async deleteByListId(listId: string): Promise<void> {
		await this.savedPostItemModel.deleteMany({ listId: new Types.ObjectId(listId) }).exec();
	}

	async findFirstMediaUrlByListIds(listIds: string[]): Promise<Record<string, string>> {
		const objectIds = listIds.map(id => new Types.ObjectId(id));

		const pipeline: PipelineStage[] = [
			{ $match: { listId: { $in: objectIds } } },
			{ $sort: { savedAt: 1 } },
			{
				$group: {
					_id: '$listId',
					postId: { $first: '$post' },
				},
			},
			{
				$lookup: {
					from: 'posts',
					localField: 'postId',
					foreignField: '_id',
					as: 'post',
				},
			},
			{ $unwind: '$post' },
			{
				$project: {
					listId: '$_id',
					mediaUrl: { $arrayElemAt: ['$post.imageUrls', 0] },
				},
			},
		];

		const results = await this.savedPostItemModel.aggregate<FirstMediaUrlResult>(pipeline).exec();

		const mediaMap: Record<string, string> = {};
		for (const result of results) {
			mediaMap[result.listId.toString()] = result.mediaUrl;
		}

		return mediaMap;
	}
}
