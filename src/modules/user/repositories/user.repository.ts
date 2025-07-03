import { ISoftDeleteBaseRepository } from '@common/crud/repos';

import { User } from '../entities';

export interface IUserRepository extends ISoftDeleteBaseRepository<User> {
	findOneByUsername(username: string): Promise<User | null>;

	/** Find a user matching the where options & match criterias to still be able to login */
	findOneLoginable(where: Partial<User>): Promise<User | null>;
}

export const IUserRepositoryToken = Symbol('IUserRepository');
