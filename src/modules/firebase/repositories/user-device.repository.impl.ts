import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserDeviceRepository } from './user-device.repository';
import { UserDevice, UserDeviceDocument } from '../entities/user-device.entity';

@Injectable()
export class UserDeviceRepositoryImpl implements IUserDeviceRepository {
	constructor(
		@InjectModel(UserDevice.name)
		private readonly userDeviceModel: Model<UserDeviceDocument>,
	) {}

	async findActiveDevicesByUserId(userId: string): Promise<UserDeviceDocument[]> {
		return this.userDeviceModel.find({ userId, isActive: true }).exec();
	}

	async saveDevice(
		userId: string,
		token: string,
		platform: 'ios' | 'android' | 'web',
	): Promise<void> {
		const existing = await this.userDeviceModel.findOne({ userId, token });
		if (!existing) {
			await this.userDeviceModel.create({ userId, token, platform });
		}
	}

	async deactivateToken(token: string): Promise<void> {
		await this.userDeviceModel.updateOne({ token }, { isActive: false }).exec();
	}
}
