import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FriendRequest, FriendRequestDocument } from '../entities/friend-request.schema';
import { Model, Types } from 'mongoose';
import { IFriendRequestRepository } from './friend-request.repository';

@Injectable()
export class FriendRequestRepositoryImpl implements IFriendRequestRepository {
	constructor(
		@InjectModel(FriendRequest.name)
		private readonly friendRequestModel: Model<FriendRequest>,
	) {}

	async create(data: Partial<FriendRequest>): Promise<FriendRequestDocument> {
		return this.friendRequestModel.create(data);
	}

	async findAny(senderId: string, receiverId: string): Promise<FriendRequest | null> {
		return this.friendRequestModel.findOne({
			sender: new Types.ObjectId(senderId),
			receiver: new Types.ObjectId(receiverId),
		});
	}

	async findPending(senderId: string, receiverId: string): Promise<FriendRequestDocument | null> {
		return this.friendRequestModel.findOne({
			sender: new Types.ObjectId(senderId),
			receiver: new Types.ObjectId(receiverId),
			status: 'pending',
		});
	}

	async findReceivedPending(receiverId: string): Promise<FriendRequest[]> {
		const receiver = new Types.ObjectId(receiverId);
		return this.friendRequestModel
			.find({ receiver: receiver, status: 'pending' })
			.populate('sender', '_id fullName avatarUrl'); // để lấy thông tin người gửi (nếu cần)
	}

	async deleteMany(user1Id: string, user2Id: string): Promise<void> {
		const user1 = new Types.ObjectId(user1Id);
		const user2 = new Types.ObjectId(user2Id);

		await this.friendRequestModel.deleteMany({
			$or: [
				{ sender: user1, receiver: user2 },
				{ sender: user2, receiver: user1 },
			],
		});
	}

	async updateStatus(senderId: string, receiverId: string, status: string): Promise<void> {
		await this.friendRequestModel.updateOne(
			{
				sender: new Types.ObjectId(senderId),
				receiver: new Types.ObjectId(receiverId),
			},
			{ $set: { status } },
		);
	}
}
