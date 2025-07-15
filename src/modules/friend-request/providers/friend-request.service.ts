import {
	Injectable,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nContext } from 'nestjs-i18n';
import { IFriendRequestRepository } from '../repositories/friend-request.repository';
import { FriendRequestStatus } from '../entities/friend-request.enum';
import { CreateFriendRequestDto } from '../dto/friend-request.dto';
import { IUserRepository } from '@modules/user/repositories/user.repository';

@Injectable()
export class FriendRequestService {
	constructor(
		private readonly friendRequestRepository: IFriendRequestRepository,
		private readonly userRepository: IUserRepository,
	) {}

	async createFriendRequest(
		createFriendRequestDto: CreateFriendRequestDto,
		senderId: string,
		i18n: I18nContext,
	) {
		const { recipientId, message } = createFriendRequestDto;

		// Check if sender and recipient are the same
		if (senderId === recipientId) {
			throw new BadRequestException(i18n.t('friend-request.CANNOT_SEND_TO_SELF'));
		}

		// Check if friend request already exists
		const existingRequest = await this.friendRequestRepository.checkExistingFriendRequest(
			new Types.ObjectId(senderId),
			new Types.ObjectId(recipientId),
		);

		if (existingRequest) {
			if (existingRequest.status === FriendRequestStatus.PENDING) {
				throw new BadRequestException(i18n.t('friend-request.REQUEST_ALREADY_EXISTS'));
			} else if (existingRequest.status === FriendRequestStatus.ACCEPTED) {
				throw new BadRequestException(i18n.t('friend-request.ALREADY_FRIENDS'));
			}
		}

		const friendRequest = await this.friendRequestRepository.createFriendRequest(
			new Types.ObjectId(senderId),
			new Types.ObjectId(recipientId),
			message,
		);

		return await this.friendRequestRepository.getFriendRequestById(friendRequest._id.toString());
	}

	async getFriendRequests(
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
		userId: string,
		type: 'sent' | 'received' = 'received',
	) {
		const result = await this.friendRequestRepository.getFriendRequests(
			new Types.ObjectId(userId),
			page,
			limit,
			type,
		);

		return result;
	}

	async acceptFriendRequest(requestId: string, userId: string, i18n: I18nContext) {
		const friendRequest = await this.friendRequestRepository.getFriendRequestById(requestId);

		if (!friendRequest) {
			throw new NotFoundException(i18n.t('friend-request.REQUEST_NOT_FOUND'));
		}

		// Check if the user is the recipient of the request
		if (friendRequest.recipient.toString() !== userId) {
			throw new ForbiddenException(i18n.t('friend-request.NOT_AUTHORIZED'));
		}

		if (friendRequest.status !== FriendRequestStatus.PENDING) {
			throw new BadRequestException(i18n.t('friend-request.REQUEST_NOT_PENDING'));
		}

		await this.friendRequestRepository.deleteFriendRequest(requestId);

		// Update friends arrays for both users
		await this.updateUsersFriendsArrays(
			friendRequest.sender.toString(),
			friendRequest.recipient.toString(),
			i18n,
		);
	}

	async declineFriendRequest(requestId: string, userId: string, i18n: I18nContext) {
		const friendRequest = await this.friendRequestRepository.getFriendRequestById(requestId);

		if (!friendRequest) {
			throw new NotFoundException(i18n.t('friend-request.REQUEST_NOT_FOUND'));
		}

		// Check if the user is the recipient of the request
		if (friendRequest.recipient.toString() !== userId) {
			throw new ForbiddenException(i18n.t('friend-request.NOT_AUTHORIZED'));
		}

		if (friendRequest.status !== FriendRequestStatus.PENDING) {
			throw new BadRequestException(i18n.t('friend-request.REQUEST_NOT_PENDING'));
		}

		await this.friendRequestRepository.deleteFriendRequest(requestId);
	}

	async checkFriendshipStatus(currentUserId: string, targetUserId: string, i18n: I18nContext) {
		// Validate that both user IDs are provided
		if (!currentUserId || !targetUserId) {
			throw new BadRequestException(i18n.t('friend-request.INVALID_USER_IDS'));
		}

		// Check if both users exist and get their friendship status
		const result = await this.friendRequestRepository.checkFriendshipStatus(
			new Types.ObjectId(currentUserId),
			new Types.ObjectId(targetUserId),
		);

		// Lấy thông tin user target để kiểm tra followers
		const targetUser = await this.userRepository.findOneById(targetUserId);
		let isFollowing = false;
		if (targetUser && Array.isArray(targetUser.followers)) {
			isFollowing = targetUser.followers.some(f => f.toString() === currentUserId);
		}

		return {
			currentUserId,
			targetUserId,
			areFriends: result.areFriends,
			friendRequestStatus: result.friendRequestStatus,
			friendRequestId: result.friendRequestId,
			friendRequestMessage: result.friendRequestMessage,
			currentUser: result.currentUser,
			targetUser: result.targetUser,
			isFollowing,
		};
	}

	async getFriendsList(
		userId: string,
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
		search?: string,
	) {
		const result = await this.friendRequestRepository.getFriendsList(
			new Types.ObjectId(userId),
			page,
			limit,
			search,
		);

		return result;
	}

	async removeFriend(userId: string, friendId: string, i18n: I18nContext) {
		// Check if both users exist
		const [user, friend] = await Promise.all([
			this.userRepository.findOneById(userId),
			this.userRepository.findOneById(friendId),
		]);

		if (!user || !friend) {
			throw new NotFoundException(i18n.t('friend-request.USER_NOT_FOUND'));
		}

		// Check if they are actually friends
		const friendshipStatus = await this.friendRequestRepository.checkFriendshipStatus(
			new Types.ObjectId(userId),
			new Types.ObjectId(friendId),
		);

		if (!friendshipStatus.areFriends) {
			throw new BadRequestException(i18n.t('friend-request.NOT_FRIENDS'));
		}

		// Remove friend from both users
		await this.friendRequestRepository.removeFriend(
			new Types.ObjectId(userId),
			new Types.ObjectId(friendId),
		);
	}

	async getMutualFriends(
		currentUserId: string,
		targetUserId: string,
		page: number = 1,
		limit: number = 10,
		i18n: I18nContext,
	) {
		// Validate that both user IDs are provided
		if (!currentUserId || !targetUserId) {
			throw new BadRequestException(i18n.t('friend-request.INVALID_USER_IDS'));
		}

		// Check if both users exist
		const [currentUser, targetUser] = await Promise.all([
			this.userRepository.findOneById(currentUserId),
			this.userRepository.findOneById(targetUserId),
		]);

		if (!currentUser || !targetUser) {
			throw new NotFoundException(i18n.t('friend-request.USER_NOT_FOUND'));
		}

		const result = await this.friendRequestRepository.getMutualFriends(
			new Types.ObjectId(currentUserId),
			new Types.ObjectId(targetUserId),
			page,
			limit,
		);

		return {
			currentUserId,
			targetUserId,
			...result,
		};
	}

	async editFriendRequestMessage(
		requestId: string,
		senderId: string,
		message: string,
		i18n: I18nContext,
	) {
		const friendRequest = await this.friendRequestRepository.getFriendRequestById(requestId);
		if (!friendRequest) {
			throw new NotFoundException(i18n.t('friend-request.REQUEST_NOT_FOUND'));
		}
		if (friendRequest.sender.toString() !== senderId) {
			throw new ForbiddenException(i18n.t('friend-request.NOT_AUTHORIZED'));
		}
		if (friendRequest.status !== FriendRequestStatus.PENDING) {
			throw new BadRequestException(i18n.t('friend-request.REQUEST_NOT_PENDING'));
		}
		return await this.friendRequestRepository.updateFriendRequestMessage(requestId, message);
	}

	async cancelFriendRequest(requestId: string, senderId: string, i18n: I18nContext) {
		const friendRequest = await this.friendRequestRepository.getFriendRequestById(requestId);
		if (!friendRequest) {
			throw new NotFoundException(i18n.t('friend-request.REQUEST_NOT_FOUND'));
		}
		if (friendRequest.sender.toString() !== senderId) {
			throw new ForbiddenException(i18n.t('friend-request.NOT_AUTHORIZED'));
		}
		if (friendRequest.status !== FriendRequestStatus.PENDING) {
			throw new BadRequestException(i18n.t('friend-request.REQUEST_NOT_PENDING'));
		}
		await this.friendRequestRepository.deleteFriendRequest(requestId);
		return { success: true };
	}

	/**
	 * Update friends arrays for both users when they become friends
	 * @param userId1 - First user ID
	 * @param userId2 - Second user ID
	 * @param i18n - Internationalization context
	 */
	private async updateUsersFriendsArrays(
		userId1: string,
		userId2: string,
		i18n: I18nContext,
	): Promise<void> {
		// Get current users to check their friends arrays
		const [user1, user2] = await Promise.all([
			this.userRepository.findOneById(userId1),
			this.userRepository.findOneById(userId2),
		]);

		if (!user1 || !user2) {
			throw new NotFoundException(i18n.t('friend-request.USER_NOT_FOUND'));
		}

		// Add each other to friends arrays if not already present
		const user1Friends = user1.friends || [];
		const user2Friends = user2.friends || [];

		// Add user2 to user1's friends list if not already there
		if (!user1Friends.some(friendId => friendId.toString() === userId2)) {
			await this.userRepository.update(userId1, {
				friends: [...user1Friends, new Types.ObjectId(userId2)],
			});
		}

		// Add user1 to user2's friends list if not already there
		if (!user2Friends.some(friendId => friendId.toString() === userId1)) {
			await this.userRepository.update(userId2, {
				friends: [...user2Friends, new Types.ObjectId(userId1)],
			});
		}
	}
}
