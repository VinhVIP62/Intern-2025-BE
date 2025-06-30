import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MongooseSoftDeleteRepositoryImpl } from '@common/types/repos';

import { User } from '../entities';
import { IUserRepository } from './user.repository';

@Injectable()
export class UserRepositoryImpl
	extends MongooseSoftDeleteRepositoryImpl<User>
	implements IUserRepository
{
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
		super(userModel, User);
	}

	async findOneByUsername(username: string): Promise<User | null> {
		const foundUser = (await this.userModel.findOne({ username }).exec())?.toObject();
		return foundUser ? foundUser : null;
	}
}
