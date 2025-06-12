import { FriendRequest } from '../../entities/friend-request.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IFriendRequestRepository extends IBaseRepository<FriendRequest> {
  findBySender(senderId: string): Promise<FriendRequest[]>;
  findByRecipient(recipientId: string): Promise<FriendRequest[]>;
  findByStatus(status: string): Promise<FriendRequest[]>;
  findBySenderAndRecipient(senderId: string, recipientId: string): Promise<FriendRequest | null>;
  updateStatus(requestId: string, status: string): Promise<boolean>;
  deleteBySenderAndRecipient(senderId: string, recipientId: string): Promise<boolean>;
}
