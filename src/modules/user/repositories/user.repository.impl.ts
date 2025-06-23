// src/modules/user/repositories/user.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.schema';
import { IUserRepository } from './user.repository';
import { EntityNotFound } from '@common/exceptions/EntityNotFound.error';
import { aw } from '@upstash/redis/zmscore-DzNHSWxc';
import { RegisterDto } from '@modules/auth/dto';
import { isEmailOrPhone } from '@common/utils/check-email-or-phone';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

	async create(data: RegisterDto): Promise<User> {
		const methodCreate = isEmailOrPhone(data.accInput);
		if (methodCreate === 'email') {
			return new this.userModel({ ...data, email: data.accInput }).save();
		}
		if (methodCreate === 'phone') {
			return new this.userModel({ ...data, phoneNumber: data.accInput }).save();
		}
		throw new Error('Invalid account input type');
	}

	async update(id: string, data: Partial<User>): Promise<User> {
		const updatedUser = await this.userModel.findByIdAndUpdate(id, data);
		if (updatedUser === null) throw new EntityNotFound(User);
		return updatedUser;
	}

	async findOneByUsername(username: string): Promise<User | null> {
		return await this.userModel.findOne({ username });
	}

	async findOneById(id: string): Promise<User | null> {
		return await this.userModel.findById(id);
	}
	async findByEmail(email: string): Promise<User | null> {
		return await this.userModel.findOne({
			email,
		});
	}
	// In user.repository.impl.ts
	async findByEmailOrNumber(emailOrNumber: string): Promise<User | null> {
		const methodCreate = isEmailOrPhone(emailOrNumber);
		if (methodCreate === 'email') {
			return await this.userModel.findOne({ email: emailOrNumber });
		}
		if (methodCreate === 'phone') {
			return await this.userModel.findOne({ phoneNumber: emailOrNumber });
		}
		throw new Error('Invalid account input type');
	}
}
