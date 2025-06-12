// src/modules/user/repositories/user.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.schema';
import { IUserRepository } from './user.repository';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

	async create(data: Partial<User>): Promise<User> {
		return new this.userModel(data).save();
	}

	async update(id: string, data: Partial<User>): Promise<User | null> {
		return this.userModel.findByIdAndUpdate(id, data).exec();
	}
}
