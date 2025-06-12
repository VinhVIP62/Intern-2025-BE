// src/modules/user/repositories/user.repository.ts
import { User } from '../entities/user.schema';

export interface IUserRepository {
	create(data: Partial<User>): Promise<User>;
	update(id: string, data: Partial<User>): Promise<User>;
}
