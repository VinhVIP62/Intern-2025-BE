// src/modules/user/repositories/user.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { User } from '../entities/user.schema';
import { IUserRepository } from './user.repository';
import { EntityNotFound } from '@common/exceptions';
import { UpdateAvatarDto } from '../dto/update-avatar.dto';
import { UpdateUserDto } from '../dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { Types } from 'mongoose';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

	async startTransaction(): Promise<ClientSession> {
		const session = await this.userModel.db.startSession();
		session.startTransaction();
		return session;
	}

	async create(data: Partial<User>): Promise<User> {
		return new this.userModel(data).save();
	}

	async updateById(id: string, data: UpdateUserDto): Promise<User> {
		const updated = await this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
		if (!updated) {
			throw new EntityNotFound('exception.user.notFound');
		}
		return updated;
	}

	async updateAvatarById(id: string, dto: UpdateAvatarDto): Promise<User> {
		const updated = await this.userModel.findByIdAndUpdate(id, dto, { new: true }).exec();
		if (!updated) {
			throw new EntityNotFound('exception.user.notFound');
		}
		return updated;
	}

	async changePasswordById(id: string, dto: UpdatePasswordDto): Promise<User> {
		const updated = await this.userModel.findByIdAndUpdate(id, dto, { new: true }).exec();
		if (!updated) {
			throw new EntityNotFound('exception.user.notFound');
		}
		return updated;
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userModel.findOne({ email }).exec();
	}

	async findManyByIds(userIds: string[]): Promise<User[]> {
		if (userIds.length === 0) return [];

		const objectIds = userIds.map(id => new Types.ObjectId(id));

		const users = await this.userModel
			.find({ _id: { $in: objectIds } })
			.select('_id fullName avatarUrl')
			.exec();

		// Đảm bảo thứ tự kết quả giống thứ tự userIds đầu vào (nếu cần)
		const userMap = new Map(users.map(user => [user._id.toString(), user]));
		return userIds.map(id => userMap.get(id)).filter(Boolean) as User[];
	}

	async findOneById(id: string): Promise<User> {
		const user = await this.userModel.findById(id).populate('sports.sport');
		if (!user) {
			throw new EntityNotFound('exception.user.notFound');
		}
		return user;
	}
}
