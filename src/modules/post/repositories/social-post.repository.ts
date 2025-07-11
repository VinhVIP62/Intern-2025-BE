import { WithPopulated } from '@common/crud/entities';
import { ISoftDeleteBaseRepository } from '@common/crud/repos';
import { CursorPaginationOption } from '@common/types/data';

import { SocialPost } from '../entities';

export interface IPostRepository extends ISoftDeleteBaseRepository<SocialPost> {
	fetchFeed(
		where: Partial<SocialPost>,
		options?: CursorPaginationOption<string>,
	): Promise<WithPopulated<SocialPost>[]>;
}

export const IPostRepositoryToken = Symbol('IPostRepository');
