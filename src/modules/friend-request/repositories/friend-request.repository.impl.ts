import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IFriendRequestRepository } from './friend-request.repository';
import { FriendRequest } from '@modules/friend-request/entities/friend-request.schema';
import { FriendRequestStatus } from '@modules/friend-request/entities/friend-request.enum';
import { User } from '@modules/user/entities/user.schema';

@Injectable()
export class FriendRequestRepositoryImpl implements IFriendRequestRepository {
	constructor(
		@InjectModel(FriendRequest.name)
		private readonly friendRequestModel: Model<FriendRequest>,
		@InjectModel(User.name)
		private readonly userModel: Model<User>,
	) {}

	async createFriendRequest(
		senderId: Types.ObjectId,
		recipientId: Types.ObjectId,
		message?: string,
	): Promise<any> {
		const friendRequest = new this.friendRequestModel({
			sender: senderId,
			recipient: recipientId,
			message,
			status: FriendRequestStatus.PENDING,
		});

		return await friendRequest.save();
	}

	async getFriendRequests(
		userId: Types.ObjectId,
		page: number,
		limit: number,
		type: 'sent' | 'received',
	): Promise<{
		friendRequests: any[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	}> {
		const query = type === 'sent' ? { sender: userId } : { recipient: userId };

		const total = await this.friendRequestModel.countDocuments(query);
		const totalPages = Math.ceil(total / limit);
		const skip = (page - 1) * limit;

		const friendRequests = await this.friendRequestModel
			.find(query)
			.populate('senderUser', 'firstName lastName avatar fullName')
			.populate('recipientUser', 'firstName lastName avatar fullName')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean({ virtuals: true });

		return {
			friendRequests,
			total,
			page,
			limit,
			totalPages,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		};
	}

	async getFriendRequestById(requestId: string): Promise<any> {
		return await this.friendRequestModel
			.findById(requestId)
			.populate('senderUser', 'firstName lastName avatar fullName')
			.populate('recipientUser', 'firstName lastName avatar fullName')
			.lean({ virtuals: true });
	}

	async updateFriendRequestStatus(requestId: string, status: FriendRequestStatus): Promise<any> {
		return await this.friendRequestModel
			.findByIdAndUpdate(requestId, { status }, { new: true })
			.populate('senderUser', 'firstName lastName avatar fullName')
			.populate('recipientUser', 'firstName lastName avatar fullName')
			.lean({ virtuals: true });
	}

	async updateFriendRequestMessage(requestId: string, message: string): Promise<any> {
		return await this.friendRequestModel
			.findByIdAndUpdate(requestId, { message }, { new: true })
			.populate('senderUser', 'firstName lastName avatar fullName')
			.populate('recipientUser', 'firstName lastName avatar fullName')
			.lean({ virtuals: true });
	}

	async checkExistingFriendRequest(
		senderId: Types.ObjectId,
		recipientId: Types.ObjectId,
	): Promise<any> {
		return await this.friendRequestModel.findOne({
			$or: [
				{ sender: senderId, recipient: recipientId },
				{ sender: recipientId, recipient: senderId },
			],
		});
	}

	async deleteFriendRequest(requestId: string): Promise<any> {
		return await this.friendRequestModel.findByIdAndDelete(requestId);
	}

	async checkFriendshipStatus(
		currentUserId: Types.ObjectId,
		targetUserId: Types.ObjectId,
	): Promise<{
		areFriends: boolean;
		friendRequestStatus?: FriendRequestStatus;
		friendRequestId?: string;
		friendRequestMessage?: string;
		currentUser?: any;
		targetUser?: any;
	}> {
		// Get both users to check their friends arrays
		const [currentUser, targetUser] = await Promise.all([
			this.userModel
				.findById(currentUserId)
				.select('friends firstName lastName avatar fullName')
				.lean({ virtuals: true }),
			this.userModel
				.findById(targetUserId)
				.select('friends firstName lastName avatar fullName')
				.lean({ virtuals: true }),
		]);

		if (!currentUser || !targetUser) {
			return {
				areFriends: false,
				currentUser: currentUser || null,
				targetUser: targetUser || null,
			};
		}

		// Check if they are friends (both users have each other in their friends array)
		const areFriends =
			currentUser.friends.some(friendId => friendId.toString() === targetUserId.toString()) &&
			targetUser.friends.some(friendId => friendId.toString() === currentUserId.toString());

		// If they are friends, return early
		if (areFriends) {
			return {
				areFriends: true,
				currentUser: {
					_id: currentUser._id,
					fullName: currentUser.fullName,
					avatar: currentUser.avatar,
				},
				targetUser: {
					_id: targetUser._id,
					fullName: targetUser.fullName,
					avatar: targetUser.avatar,
				},
			};
		}

		// If not friends, check if there's a pending friend request
		const friendRequest = await this.friendRequestModel.findOne({
			$or: [
				{ sender: currentUserId, recipient: targetUserId },
				{ sender: targetUserId, recipient: currentUserId },
			],
		});

		return {
			areFriends: false,
			friendRequestStatus: friendRequest?.status,
			friendRequestId: friendRequest?._id?.toString(),
			friendRequestMessage: friendRequest?.message,
			currentUser: {
				_id: currentUser._id,
				fullName: currentUser.fullName,
				avatar: currentUser.avatar,
			},
			targetUser: {
				_id: targetUser._id,
				fullName: targetUser.fullName,
				avatar: targetUser.avatar,
			},
		};
	}

	async getFriendsList(
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
	}> {
		// Get user's friends array
		const user = await this.userModel.findById(userId).select('friends').lean({ virtuals: true });
		if (!user || !user.friends || user.friends.length === 0) {
			return {
				friends: [],
				total: 0,
				page,
				limit,
				totalPages: 0,
				hasNextPage: false,
				hasPrevPage: false,
			};
		}

		// Build search query
		let searchQuery: any = { _id: { $in: user.friends } };
		if (search) {
			const regex = new RegExp(search, 'i');
			searchQuery = {
				...searchQuery,
				$or: [{ fullName: regex }, { firstName: regex }, { lastName: regex }, { email: regex }],
			};
		}

		const total = await this.userModel.countDocuments(searchQuery);
		const totalPages = Math.ceil(total / limit);
		const skip = (page - 1) * limit;

		const friends = await this.userModel
			.find(searchQuery)
			.select('firstName lastName avatar fullName')
			.sort({ fullName: 1 })
			.skip(skip)
			.limit(limit)
			.lean({ virtuals: true });

		return {
			friends,
			total,
			page,
			limit,
			totalPages,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		};
	}

	async removeFriend(userId: Types.ObjectId, friendId: Types.ObjectId): Promise<void> {
		// Remove friend from both users' friends arrays
		await Promise.all([
			this.userModel.findByIdAndUpdate(userId, {
				$pull: { friends: friendId },
			}),
			this.userModel.findByIdAndUpdate(friendId, {
				$pull: { friends: userId },
			}),
		]);

		// Also delete any existing friend request between them
		await this.friendRequestModel.deleteMany({
			$or: [
				{ sender: userId, recipient: friendId },
				{ sender: friendId, recipient: userId },
			],
		});
	}

	async getMutualFriends(
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
	}> {
		// Get both users' friends arrays
		const [user1, user2] = await Promise.all([
			this.userModel.findById(userId1).select('friends').lean({ virtuals: true }),
			this.userModel.findById(userId2).select('friends').lean({ virtuals: true }),
		]);

		if (!user1 || !user2 || !user1.friends || !user2.friends) {
			return {
				mutualFriends: [],
				total: 0,
				page,
				limit,
				totalPages: 0,
				hasNextPage: false,
				hasPrevPage: false,
			};
		}

		// Find mutual friends (intersection of both friends arrays)
		const mutualFriendIds = user1.friends.filter(friendId =>
			user2.friends.some(friendId2 => friendId.toString() === friendId2.toString()),
		);

		if (mutualFriendIds.length === 0) {
			return {
				mutualFriends: [],
				total: 0,
				page,
				limit,
				totalPages: 0,
				hasNextPage: false,
				hasPrevPage: false,
			};
		}

		const total = mutualFriendIds.length;
		const totalPages = Math.ceil(total / limit);
		const skip = (page - 1) * limit;

		const mutualFriends = await this.userModel
			.find({ _id: { $in: mutualFriendIds } })
			.select('firstName lastName avatar fullName')
			.sort({ fullName: 1 })
			.skip(skip)
			.limit(limit)
			.lean({ virtuals: true });

		return {
			mutualFriends,
			total,
			page,
			limit,
			totalPages,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		};
	}
}
