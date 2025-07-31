import { Friend } from '../entities/friend.schema';
import { Types } from 'mongoose';

export abstract class IFriendRepository {
	abstract create(user1Id: string, user2Id: string): Promise<Friend>;
	abstract isFriend(user1Id: string, user2Id: string): Promise<boolean>;
	abstract findAllByUserId(userId: string): Promise<Types.ObjectId[]>;
	abstract filterFriendIds(userId: string, targetUserIds: string[]): Promise<string[]>;
	abstract delete(user1Id: string, user2Id: string): Promise<void>;
}
