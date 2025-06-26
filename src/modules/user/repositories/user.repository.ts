import { User } from '../entities/user.schema';
import { IBaseRepository } from '@common/types';

export interface IUserRepository extends IBaseRepository<User> {
	findOneByUsername(username: string): Promise<User | null>;
}

export const IUserRepositoryToken = Symbol('IUserRepository');
