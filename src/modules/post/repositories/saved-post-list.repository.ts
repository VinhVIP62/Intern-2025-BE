import { SavedPostList, SavedPostListDocument } from '../entities/saved-post-list.schema';

export abstract class ISavedPostListRepository {
	abstract create(data: Partial<SavedPostList>): Promise<SavedPostListDocument>;
	abstract findByUserAndName(userId: string, name: string): Promise<SavedPostListDocument | null>;
	abstract findAllByUserIdWithPagination(
		userId: string,
		page: number,
		limit: number,
	): Promise<{ data: SavedPostListDocument[]; total: number }>;
	abstract findById(id: string): Promise<SavedPostList | null>;
	abstract deleteById(id: string): Promise<void>;
}
