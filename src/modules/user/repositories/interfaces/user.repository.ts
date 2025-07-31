import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.schema';

@Injectable()
export abstract class IUserRepository {
	abstract create(data: Partial<User>): Promise<User>;
	abstract update(id: string, data: Partial<User>): Promise<User>;
	abstract findOneByUsername(username: string): Promise<User | null>;
	abstract findOneByUsernameOrEmail(username: string, email: string): Promise<User | null>;
	abstract findOneById(id: string): Promise<User | null>;
	abstract findOneByEmail(email: string): Promise<User | null>;
	abstract getUserSortByReportCount(
		limit: number,
		page: number,
	): Promise<{
		total: number;
		page: number;
		limit: number;
		items: User[];
	}>;
}
