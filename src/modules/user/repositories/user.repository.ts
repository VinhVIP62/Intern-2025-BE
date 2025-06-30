import { ISoftDeleteBaseRepository } from '@common/types/repos';

import { User } from '../entities';

export interface IUserRepository extends ISoftDeleteBaseRepository<User> {
	findOneByUsername(username: string): Promise<User | null>;
}

export const IUserRepositoryToken = Symbol('IUserRepository');
