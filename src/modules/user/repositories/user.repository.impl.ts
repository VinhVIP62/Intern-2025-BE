// src/modules/user/repositories/user.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.schema';
import { IUserRepository } from './user.repository';
import { EntityNotFound } from '@common/exceptions/EntityNotFound.error';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

	async create(data: Partial<User>): Promise<User> {
		return new this.userModel(data).save();
	}

	async update(id: string, data: Partial<User>): Promise<User> {
		const updatedUser = await this.userModel.findByIdAndUpdate(id, data);
		if (updatedUser === null) throw new EntityNotFound(User);
		return updatedUser;
	}

	async findOneByEmail(email: string): Promise<User | null> {
		return await this.userModel.findOne({ email });
	}

	async findOneById(id: string): Promise<User | null> {
		return await this.userModel.findById(id);
	}

	async findFriendsByFullName(
		userId: string,
		fullName: string,
		page: number,
		limit: number,
	): Promise<User[]> {
		// Lấy user để lấy danh sách bạn bè
		const user = await this.userModel.findById(userId).populate('friends');
		if (!user) return [];
		const friendIds = user.friends.map((f: any) => (f._id ? f._id : f));

		// Tìm bạn bè theo fullname (không phân biệt hoa thường)
		const regex = new RegExp(fullName, 'i');
		return this.userModel
			.find({
				_id: { $in: friendIds },
				$or: [{ fullName: regex }, { firstName: regex }, { lastName: regex }],
			})
			.skip((page - 1) * limit)
			.limit(limit)
			.exec();
	}
}
