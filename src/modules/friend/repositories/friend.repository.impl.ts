import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Friend } from '../entities/friend.schema';
import { Injectable } from '@nestjs/common';
import { IFriendRepository } from './friend.repository';
import { BadRequest } from '@common/exceptions';

@Injectable()
export class FriendRepositoryImpl implements IFriendRepository {
	constructor(@InjectModel(Friend.name) private readonly model: Model<Friend>) {}

	async create(user1Id: string, user2Id: string): Promise<Friend> {
		if (!user1Id || !user2Id) {
			throw new BadRequest('validation.friend.required');
		}
		// đảm bảo user1Id < user2Id để tránh duplication
		const [u1, u2] = [user1Id, user2Id].sort();
		// console.log('User1: ', u1, 'User2: ', u2);

		return this.model.create({
			user1: new Types.ObjectId(u1),
			user2: new Types.ObjectId(u2),
		});
	}

	async isFriend(user1Id: string, user2Id: string): Promise<boolean> {
		const [u1, u2] = [user1Id, user2Id].sort();
		const result = await this.model.findOne({
			user1: new Types.ObjectId(u1),
			user2: new Types.ObjectId(u2),
		});
		return !!result;
	}

	async findAllByUserId(userId: string): Promise<Types.ObjectId[]> {
		const userObjectId = new Types.ObjectId(userId);

		const friends = await this.model.find({
			$or: [{ user1: userObjectId }, { user2: userObjectId }],
		});

		// Trích danh sách bạn bè từ user1/user2
		const friendIds = friends.map(f => (f.user1.equals(userObjectId) ? f.user2 : f.user1));

		return friendIds;
	}

	async delete(user1Id: string, user2Id: string): Promise<void> {
		const u1 = new Types.ObjectId(user1Id);
		const u2 = new Types.ObjectId(user2Id);

		await this.model.deleteOne({
			$or: [
				{ user1: u1, user2: u2 },
				{ user1: u2, user2: u1 },
			],
		});
	}
}
