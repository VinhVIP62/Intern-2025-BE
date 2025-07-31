import { FriendRequest, FriendRequestDocument } from '../entities/friend-request.schema';

export abstract class IFriendRequestRepository {
	abstract create(data: Partial<FriendRequest>): Promise<FriendRequestDocument>;
	abstract findAny(senderId: string, receiverId: string): Promise<FriendRequest | null>;
	abstract findPending(senderId: string, receiverId: string): Promise<FriendRequestDocument | null>;
	abstract findReceivedPending(receiverId: string): Promise<FriendRequest[]>;
	abstract deleteMany(user1Id: string, user2Id: string): Promise<void>;
	abstract updateStatus(senderId: string, receiverId: string, status: string): Promise<void>;
}
