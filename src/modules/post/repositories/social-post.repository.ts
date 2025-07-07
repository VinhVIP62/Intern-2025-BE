import { WithPopulated } from '@common/crud/entities';
import { ISoftDeleteBaseRepository } from '@common/crud/repos';

import { SocialPost } from '../entities';

export interface IPostRepository extends ISoftDeleteBaseRepository<SocialPost> {
	fetchPost(id: string, userId: string): Promise<WithPopulated<SocialPost> | null>;
}

export const IPostRepositoryToken = Symbol('IPostRepository');
