import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IFriendRepository } from '../repositories/friend.repository';
import { FriendReq } from '../entities/friend-req.schema';
import { FriendPaginationDto } from '../dto/response/friend.Pagination.dto';
import { FriendStatus } from '@modules/friend/enum/friendStatus.enum';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { FriendDto } from '@modules/friend/dto/response/friend.dto';

@Injectable()
export class FriendService {
	constructor(
		private readonly friendRepository: IFriendRepository,
		private readonly notificationService: NotificationService,
	) {}

	async createFriendRequest(senderId: string, receiverId: string): Promise<FriendReq> {
		const friendRequest = await this.friendRepository.findOne(
			{
				$or: [
					{ sender: senderId, receiver: receiverId },
					{ sender: receiverId, receiver: senderId },
				],
			},
			true,
		);
		if (friendRequest) {
			if (friendRequest.status === FriendStatus.PENDING) {
				throw new BadRequestException('Friend request already exists');
			}
			throw new BadRequestException('Friend request already accepted');
		}
		const newFriendRequest = await this.friendRepository.create({
			sender: senderId,
			receiver: receiverId,
			status: FriendStatus.PENDING,
		});
		await this.notificationService.createNotification({
			userId: receiverId,
			ownerTypeId: newFriendRequest._id.toString(),
			type: 'friend',
			read: false,
		});
		return newFriendRequest;
	}

	async getFriendRequests(
		userId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<FriendPaginationDto> {
		if ((page && page < 0) || (limit && limit < 0)) {
			throw new BadRequestException('Page and limit must be greater than 0');
		}

		if (limit && limit > 30) {
			throw new BadRequestException('Limit must be less than 30');
		}
		return await this.friendRepository.findUserRequests(
			{ receiver: userId, status: FriendStatus.PENDING },
			page,
			limit,
		);
	}

	async getMyRequests(
		senderId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<FriendPaginationDto> {
		if ((page && page < 0) || (limit && limit < 0)) {
			throw new BadRequestException('Page and limit must be greater than 0');
		}

		if (limit && limit > 30) {
			throw new BadRequestException('Limit must be less than 30');
		}
		//get list of requests with pagination
		const requests = await this.friendRepository.findUserRequests(
			{ sender: senderId, status: FriendStatus.PENDING },
			page,
			limit,
		);

		return requests;
	}

	async getFriends(
		userId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<FriendPaginationDto> {
		if ((page && page < 0) || (limit && limit < 0)) {
			throw new BadRequestException('Page and limit must be greater than 0');
		}

		if (limit && limit > 30) {
			throw new BadRequestException('Limit must be less than 30');
		}
		//get list of friends
		const friends = await this.friendRepository.findUserFriends(userId, page, limit);
		return friends;
	}
	async fetchAllFriends(userId: string): Promise<string[]> {
		const friends = await this.friendRepository.find({
			$or: [
				{ sender: userId, status: FriendStatus.ACCEPTED },
				{ receiver: userId, status: FriendStatus.ACCEPTED },
			],
		});
		if (!friends) {
			return [];
		}
		return friends.map(friend =>
			friend.sender.toString() === userId ? friend.receiver.toString() : friend.sender.toString(),
		);
	}

	async acceptFriendRequest(idUser: string, idFriend: string): Promise<FriendDto | null> {
		//case
		const friendRequest = await this.friendRepository.findOne(
			{
				sender: idFriend,
				receiver: idUser,
			},
			false,
		);
		if (!friendRequest) {
			throw new NotFoundException('Friend request not found');
		}
		if (friendRequest.status !== FriendStatus.PENDING) {
			throw new BadRequestException('Friend request not pending');
		}
		const updatedFriendRequest = await this.friendRepository.update(idUser, idFriend, {
			status: FriendStatus.ACCEPTED,
		});
		await this.notificationService.deleteNotification(idUser, friendRequest.id);
		return updatedFriendRequest;
	}

	async rejectFriendRequest(idUser: string, idFriend: string): Promise<void> {
		let friendRequest = await this.friendRepository.findOne(
			{
				sender: idUser,
				receiver: idFriend,
			},
			true,
		);
		// console.log(friendRequest);

		//cancel request
		if (friendRequest) {
			if (friendRequest.status !== FriendStatus.PENDING) {
				throw new BadRequestException('Friend request not pending');
			}
			await this.notificationService.deleteNotification(idFriend, friendRequest.id);
			return await this.friendRepository.delete(idUser, idFriend);
		}
		//reject request
		friendRequest = await this.friendRepository.findOne(
			{
				sender: idFriend,
				receiver: idUser,
			},
			false,
		);
		// console.log(friendRequest);
		if (!friendRequest) {
			throw new NotFoundException('Friend request not found');
		}
		if (friendRequest.status !== FriendStatus.PENDING) {
			throw new BadRequestException('Friend request not pending');
		}
		await this.notificationService.deleteNotification(idUser, friendRequest.id);
		return await this.friendRepository.delete(idUser, idFriend);
	}
	async isFriend(idUser: string, idFriend: string): Promise<string> {
		let friendRequest = await this.friendRepository.findOne(
			{
				sender: idUser,
				receiver: idFriend,
			},
			true,
		);
		if (friendRequest) {
			if (friendRequest.status === FriendStatus.ACCEPTED) {
				return FriendStatus.FRIEND;
			}
			return FriendStatus.PENDING;
		}
		friendRequest = await this.friendRepository.findOne(
			{
				sender: idFriend,
				receiver: idUser,
			},
			false,
		);
		if (friendRequest) {
			if (friendRequest.status === FriendStatus.ACCEPTED) {
				return FriendStatus.FRIEND;
			}
			return FriendStatus.REQUESTED;
		}
		return FriendStatus.NOT_FRIEND;
	}

	async deleteFriend(idUser: string, idFriend: string): Promise<void> {
		const friendRequest = await this.friendRepository.findOne(
			{
				$or: [
					{ sender: idUser, receiver: idFriend },
					{ sender: idFriend, receiver: idUser },
				],
			},
			false,
		);
		if (!friendRequest) {
			throw new NotFoundException('Friend request not found');
		}
		if (friendRequest.status !== FriendStatus.ACCEPTED) {
			throw new BadRequestException('Friend request not accepted');
		}
		return await this.friendRepository.delete(idUser, idFriend);
	}
}
