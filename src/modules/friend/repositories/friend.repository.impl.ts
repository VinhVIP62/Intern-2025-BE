import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Friend } from '../entities/friend.schema';
import { FriendState } from '@common/enum/friend.state.enum';
import { IFriendRepository } from './friend.repository';

@Injectable()
export class FriendRepository implements IFriendRepository {
	constructor(@InjectModel(Friend.name) private readonly model: Model<Friend>) {}

	async create(fromUserId: string, toUserId: string): Promise<Friend> {
		return this.model.create({ fromUserId, toUserId, state: FriendState.PENDING });
	}

	async findOne(fromUserId: string, toUserId: string): Promise<Friend | null> {
		return this.model.findOne({ fromUserId, toUserId });
	}
	async findBetween(fromUserId: string, toUserId: string): Promise<Friend | null> {
		return this.model.findOne({
			$or: [
				{ fromUserId: fromUserId, toUserId: toUserId },
				{ fromUserId: toUserId, toUserId: fromUserId },
			],
		});
	}
	async updateState(
		fromUserId: string,
		toUserId: string,
		state: FriendState,
	): Promise<Friend | null> {
		return this.model.findOneAndUpdate(
			{ fromUserId, toUserId, state: FriendState.PENDING },
			{ state },
			{ new: true },
		);
	}

	async getAccepted(userId: string): Promise<Friend[]> {
		return this.model.find({
			$or: [
				{ fromUserId: userId, state: FriendState.ACCEPTED },
				{ toUserId: userId, state: FriendState.ACCEPTED },
			],
		});
	}

	async deleteRequest(fromUserId: string, toUserId: string): Promise<Friend | null> {
		return this.model.findOneAndDelete({ fromUserId, toUserId });
	}
}
