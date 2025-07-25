import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SearchHistory } from '@modules/search/entities/searchHistory.schema';
import { CreateSearchHistoryInternalDto } from '@modules/search/dto';
import { ISearchHistoryRepository } from '@modules/search/interfaces/searchHistory.repository';

@Injectable()
export class SearchHistoryRepositoryImpl implements ISearchHistoryRepository {
	constructor(
		@InjectModel(SearchHistory.name)
		private readonly searchHistoryModel: Model<SearchHistory>,
	) {}

	async create(
		userId: Types.ObjectId,
		dto: CreateSearchHistoryInternalDto,
	): Promise<SearchHistory> {
		return this.searchHistoryModel.create({ ...dto, userId });
	}

	async findByUserId(userId: Types.ObjectId, limit = 10): Promise<SearchHistory[]> {
		return this.searchHistoryModel.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
	}

	async findByUserIdPagination(
		userId: Types.ObjectId,
		page = 1,
		limit = 10,
	): Promise<{ data: SearchHistory[]; total: number }> {
		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			this.searchHistoryModel
				.find({ userId: new Types.ObjectId(userId) })
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			this.searchHistoryModel.countDocuments({ userId }),
		]);
		return { data, total };
	}

	async findAll(limit = 50): Promise<SearchHistory[]> {
		return this.searchHistoryModel.find().sort({ createdAt: -1 }).limit(limit).lean();
	}

	async delete(id: Types.ObjectId): Promise<void> {
		await this.searchHistoryModel.deleteOne({ _id: id });
	}
}
