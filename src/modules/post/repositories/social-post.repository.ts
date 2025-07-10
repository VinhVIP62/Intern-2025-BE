import { WithPopulated } from '@common/crud/entities';
import { ISoftDeleteBaseRepository } from '@common/crud/repos';
import { CursorPaginationOption } from '@common/types/data';

import { SocialPost } from '../entities';

export interface IPostRepository extends ISoftDeleteBaseRepository<SocialPost> {
	fetchPost(id: string, userId: string): Promise<WithPopulated<SocialPost> | null>;
	fetchFeed(
		userId: string,
		options?: CursorPaginationOption<string>,
	): Promise<WithPopulated<SocialPost>[]>;
}

export const IPostRepositoryToken = Symbol('IPostRepository');
