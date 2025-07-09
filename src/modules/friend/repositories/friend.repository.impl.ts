import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FriendReq } from '../entities/friend-req.schema';
import { Model } from 'mongoose';
import { IFriendRepository } from './friend.repository';

@Injectable()
export class FriendRepositoryImpl implements IFriendRepository {
	constructor(
		@InjectModel(FriendReq.name)
		private friendReqModel: Model<FriendReq>,
	) {}

	async create(data: Partial<FriendReq>): Promise<FriendReq> {
		return this.friendReqModel.create(data);
	}

	async find(query: any): Promise<FriendReq | null> {
		return this.friendReqModel.findOne(query).exec();
	}

	async findAll(query: any): Promise<FriendReq[]> {
		return this.friendReqModel.find(query).exec();
	}

	async update(
		idUser: string,
		idFriend: string,
		data: Partial<FriendReq>,
	): Promise<FriendReq | null> {
		return this.friendReqModel.findOneAndUpdate(
			{
				$or: [
					{ senderId: idUser, receiverId: idFriend },
					{ senderId: idFriend, receiverId: idUser },
				],
			},
			data,
			{ new: true },
		);
	}

	async delete(idUser: string, idFriend: string): Promise<void> {
		await this.friendReqModel
			.deleteOne({
				$or: [
					{
						senderId: idUser,
						receiverId: idFriend,
					},
					{
						senderId: idFriend,
						receiverId: idUser,
					},
				],
			})
			.exec();
	}
}
