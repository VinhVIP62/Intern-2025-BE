import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GRACE_PERIOD } from '@common/constants';
import { WithPopulated } from '@common/crud/entities';
import { MongooseSoftDeleteRepositoryImpl } from '@common/crud/repos';

import { User } from '../entities';
import { IUserRepository } from './user.repository';

@Injectable()
export class UserRepositoryImpl
	extends MongooseSoftDeleteRepositoryImpl<User>
	implements IUserRepository
{
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
		super(userModel, User, {
			populate: ['deletedBy'],
		});
	}

	async findOneByUsername(username: string): Promise<WithPopulated<User> | null> {
		const foundUser = (
			await this.userModel
				.findOne(this.transformFilter({ username }))
				.populate(this.transformPopulate())
				.exec()
		)?.toObject();
		return foundUser ? foundUser : null;
	}

	async findOneLoginable(where: Partial<User>): Promise<WithPopulated<User> | null> {
		return (
			(
				await this.entityModel
					.findOne(
						this.transformFilter(
							{
								...where,
								$or: [
									{ deleted: false },
									{
										$expr: { $eq: ['$deletedBy', '$_id'] },
										deletedAt: { $gte: new Date(Date.now() - GRACE_PERIOD * 24 * 60 * 60 * 1000) },
									},
								],
							},
							{
								doNotUseRepoOptions: ['filter'],
							},
						),
					)
					.populate(this.transformPopulate())
					.exec()
			)?.toObject() || null
		);
	}
}
