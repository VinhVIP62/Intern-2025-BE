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

	async findOneByUsername(username: string): Promise<User | null> {
		return await this.userModel.findOne({ username });
	}

	async findOneById(id: string): Promise<User | null> {
		return await this.userModel.findById(id);
	}
}
