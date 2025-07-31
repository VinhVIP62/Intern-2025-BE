import { Types } from 'mongoose';
import { FriendRequestStatus } from '@modules/friend-request/entities/friend-request.enum';

export interface IFriendRequestRepository {
	createFriendRequest(
		senderId: Types.ObjectId,
		recipientId: Types.ObjectId,
		message?: string,
	): Promise<any>;

	getFriendRequests(
		userId: Types.ObjectId,
		page: number,
		limit: number,
		type: 'sent' | 'received',
		status?: FriendRequestStatus,
	): Promise<{
		friendRequests: any[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	}>;

	getFriendRequestById(requestId: string): Promise<any>;

	updateFriendRequestStatus(requestId: string, status: FriendRequestStatus): Promise<any>;

	updateFriendRequestMessage(requestId: string, message: string): Promise<any>;

	checkExistingFriendRequest(senderId: Types.ObjectId, recipientId: Types.ObjectId): Promise<any>;

	deleteFriendRequest(requestId: string): Promise<any>;

	checkFriendshipStatus(
		currentUserId: Types.ObjectId,
		targetUserId: Types.ObjectId,
	): Promise<{
		areFriends: boolean;
		friendRequestStatus?: FriendRequestStatus;
		friendRequestId?: string;
		friendRequestMessage?: string;
		currentUser?: any;
		targetUser?: any;
	}>;

	getFriendsList(
		userId: Types.ObjectId,
		page: number,
		limit: number,
		search?: string,
	): Promise<{
		friends: any[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	}>;

	removeFriend(userId: Types.ObjectId, friendId: Types.ObjectId): Promise<void>;

	getMutualFriends(
		userId1: Types.ObjectId,
		userId2: Types.ObjectId,
		page: number,
		limit: number,
	): Promise<{
		mutualFriends: any[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	}>;
}

export const IFriendRequestRepository = Symbol('IFriendRequestRepository');
