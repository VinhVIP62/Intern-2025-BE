import { SavedPostItem, SavedPostItemDocument } from '../entities/saved-post-item.schema';

export abstract class ISavedPostItemRepository {
	abstract create(data: Partial<SavedPostItem>): Promise<SavedPostItem>;
	abstract findByListIdWithPagination(
		listId: string,
		page: number,
		limit: number,
	): Promise<{ data: SavedPostItemDocument[]; total: number }>;

	abstract removeFromList(listId: string, postId: string): Promise<void>;

	abstract deleteByListId(listId: string): Promise<void>;

	abstract findFirstMediaUrlByListIds(listIds: string[]): Promise<Record<string, string>>;
}
