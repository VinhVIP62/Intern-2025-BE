import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entities';
import { IUserRepository } from './user.repository';
import { MongooseRepositoryImpl } from '@common/types/mongoose-repository.type';

@Injectable()
export class UserRepositoryImpl extends MongooseRepositoryImpl<User> implements IUserRepository {
	constructor(@InjectModel(UserDocument.name) private readonly userModel: Model<User>) {
		super(userModel, User);
	}

	async findOneByUsername(username: string): Promise<User | null> {
		const foundUser = (await this.userModel.findOne({ username }).exec())?.toObject();
		return foundUser ? foundUser : null;
	}
}
