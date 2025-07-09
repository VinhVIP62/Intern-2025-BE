import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IFriendRepository } from '../repositories/friend.repository';
import { FriendReq } from '../entities/friend-req.schema';

@Injectable()
export class FriendService {
	constructor(private readonly friendRepository: IFriendRepository) {}

	async createFriendRequest(senderId: string, receiverId: string): Promise<FriendReq> {
		const friendRequest = await this.friendRepository.find({
			$or: [
				{ senderId, receiverId },
				{ senderId: receiverId, receiverId: senderId },
			],
		});
		if (friendRequest) {
			throw new BadRequestException('Friend request already exists');
		}
		return await this.friendRepository.create({
			senderId,
			receiverId,
			status: 'pending',
		});
	}

	async getFriendRequests(userId: string): Promise<FriendReq | null> {
		return await this.friendRepository.find({ receiverId: userId, status: 'pending' });
	}

	async getMyRequests(senderId: string): Promise<FriendReq | null> {
		return await this.friendRepository.find({ senderId: senderId, status: 'pending' });
	}

	async getMyFriends(userId: string): Promise<FriendReq[]> {
		//get list of friends
		return await this.friendRepository.findAll({
			$or: [
				{ senderId: userId, status: 'accepted' },
				{ receiverId: userId, status: 'accepted' },
			],
		});
	}

	async acceptFriendRequest(idUser: string, idFriend: string): Promise<FriendReq | null> {
		const friendRequest = await this.friendRepository.find({
			$or: [
				{ senderId: idUser, receiverId: idFriend },
				{ senderId: idFriend, receiverId: idUser },
			],
		});
		if (!friendRequest) {
			throw new NotFoundException('Friend request not found');
		}
		if (friendRequest.status !== 'pending') {
			throw new BadRequestException('Friend request not pending');
		}
		return await this.friendRepository.update(idUser, idFriend, { status: 'accepted' });
	}

	async rejectFriendRequest(idUser: string, idFriend: string): Promise<void> {
		const friendRequest = await this.friendRepository.find({
			$or: [
				{ senderId: idUser, receiverId: idFriend },
				{ senderId: idFriend, receiverId: idUser },
			],
		});
		if (!friendRequest) {
			throw new NotFoundException('Friend request not found');
		}
		if (friendRequest.status !== 'pending') {
			throw new BadRequestException('Friend request not pending');
		}
		return await this.friendRepository.delete(idUser, idFriend);
	}

	async deleteFriend(idUser: string, idFriend: string): Promise<void> {
		const friendRequest = await this.friendRepository.find({
			$or: [
				{ senderId: idUser, receiverId: idFriend },
				{ senderId: idFriend, receiverId: idUser },
			],
		});
		if (!friendRequest) {
			throw new NotFoundException('Friend request not found');
		}
		if (friendRequest.status !== 'accepted') {
			throw new BadRequestException('Friend request not accepted');
		}
		return await this.friendRepository.delete(idUser, idFriend);
	}
}
