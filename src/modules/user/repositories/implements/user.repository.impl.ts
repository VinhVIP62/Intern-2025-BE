import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../entities/user.schema';
import { IUserRepository } from '../interfaces/user.repository';
import { EntityNotFound } from '@common/exceptions/EntityNotFound.error';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

	async create(data: Partial<User>): Promise<User> {
		return new this.userModel(data).save();
	}

	async update(id: string, data: Partial<User>): Promise<User> {
		const updatedUser = await this.userModel.findOneAndUpdate({ id }, data, {
			new: true,
			runValidators: true,
		});
		if (updatedUser === null) throw new EntityNotFound(User);
		return updatedUser;
	}

	async findOneByUsername(username: string): Promise<User | null> {
		return await this.userModel.findOne({ username });
	}

	async findOneByUsernameOrEmail(username: string, email: string) {
		return await this.userModel.findOne({
			$or: [{ username: username }, { email: email }],
		});
	}

	async findOneById(id: string): Promise<User | null> {
		return await this.userModel.findOne({ id: id });
	}
	async findOneByEmail(email: string): Promise<User | null> {
		return await this.userModel.findOne({ email });
	}

	async getUserSortByReportCount(
		limit: number,
		page: number,
	): Promise<{
		total: number;
		page: number;
		limit: number;
		items: any[];
	}> {
		if (limit <= 0 || page < 0) {
			throw new Error('Invalid limit or page number');
		}

		const total = await this.userModel.countDocuments({ reportCount: { $gt: -1 } });

		const skip = limit * page;

		const items = await this.userModel
			.aggregate([
				{
					$sort: { reportCount: -1 },
				},
				{
					$skip: skip,
				},
				{
					$limit: limit,
				},
				{
					$lookup: {
						as: 'profile',
						from: 'profiles',
						foreignField: 'userId',
						localField: 'id',
					},
				},
				{
					$unwind: {
						path: '$profile',
					},
				},
				{
					$project: {
						_id: 0,
						id: 1,
						username: 1,
						email: 1,
						reportCount: 1,
						// Thông tin từ profile
						firstName: '$profile.firstName',
						lastName: '$profile.lastName',
						nickname: '$profile.nickname',
						avatarUrl: '$profile.avatarUrl',
						gender: '$profile.gender',
						birthday: '$profile.birthday',
					},
				},
			])
			.exec();
		return {
			total,
			page,
			limit,
			items,
		};
	}
}
