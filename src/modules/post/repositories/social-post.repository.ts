import { QuerriableType, WithPopulated } from '@common/crud/entities';
import { ISoftDeleteBaseRepository } from '@common/crud/repos';
import { CursorPaginationOption } from '@common/types/data';

import { SocialPost } from '../entities';

export interface IPostRepository extends ISoftDeleteBaseRepository<SocialPost> {
	fetchFeed(
		where: QuerriableType<SocialPost>,
		options?: CursorPaginationOption<string>,
	): Promise<WithPopulated<SocialPost>[]>;

	findOneAndUpdateWithFiles(
		where: QuerriableType<SocialPost>,
		data: Partial<SocialPost>,
		deletedFilesIdx?: number[],
	): Promise<WithPopulated<SocialPost>>;
}

export const IPostRepositoryToken = Symbol('IPostRepository');
