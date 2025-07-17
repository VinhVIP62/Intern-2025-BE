// src/modules/user/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.schema';

@Injectable()
export abstract class IUserRepository {
	abstract create(data: Partial<User>): Promise<User>;
	abstract update(id: string, data: Partial<User>): Promise<User>;
	abstract findOneByEmail(email: string): Promise<User | null>;
	abstract findOneById(id: string): Promise<User | null>;
	abstract findFriendsByKey(
		userId: string,
		key: string,
		page: number,
		limit: number,
	): Promise<User[]>;
	abstract followUser(currentUserId: string, targetUserId: string): Promise<void>;
	abstract unfollowUser(currentUserId: string, targetUserId: string): Promise<void>;
	abstract getFollowers(userId: string): Promise<any[]>;
	abstract getFollowing(userId: string): Promise<any[]>;
	abstract blockUser(currentUserId: string, targetUserId: string): Promise<void>;
	abstract unblockUser(currentUserId: string, targetUserId: string): Promise<void>;
	abstract getBlockedUsers(userId: string): Promise<any[]>;
	abstract removeFollower(currentUserId: string, followerId: string): Promise<void>;
}
