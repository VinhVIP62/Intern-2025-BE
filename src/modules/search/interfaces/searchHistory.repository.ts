import { CreateSearchHistoryInternalDto } from '@modules/search/dto';
import { SearchHistory } from '@modules/search/entities/searchHistory.schema';
import { Types } from 'mongoose';

export interface ISearchHistoryRepository {
	create(userId: Types.ObjectId, dto: CreateSearchHistoryInternalDto): Promise<SearchHistory>;
	findByUserId(userId: Types.ObjectId, limit?: number): Promise<SearchHistory[]>;
	findAll(limit?: number): Promise<SearchHistory[]>;
	delete(id: Types.ObjectId): Promise<void>;
	findByUserIdPagination(
		userId: Types.ObjectId,
		page?: number,
		limit?: number,
	): Promise<{ data: SearchHistory[]; total: number }>;
}

export const ISearchHistoryRepository = Symbol('ISearchHistoryRepository');
