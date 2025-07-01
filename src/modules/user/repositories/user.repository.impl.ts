import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GRACE_PERIOD } from '@common/constants';
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

	findOneLoginable(where: Partial<User>): Promise<User | null> {
		return this.findOneByRawFilter({
			...where,
			deleted: undefined,
			$or: [
				{ deleted: false },
				{
					$expr: { $eq: ['$deletedBy', { $toString: '$_id' }] },
					deletedAt: { $gte: new Date(Date.now() - GRACE_PERIOD * 24 * 60 * 60 * 1000) },
				},
			],
		});
	}
}
