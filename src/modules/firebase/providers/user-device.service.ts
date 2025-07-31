import { Injectable } from '@nestjs/common';
import { IUserDeviceRepository } from '../repositories/user-device.repository';

@Injectable()
export class UserDeviceService {
	constructor(private readonly userDeviceRepository: IUserDeviceRepository) {}

	async registerDevice(
		userId: string,
		token: string,
		platform: 'ios' | 'android' | 'web',
	): Promise<void> {
		await this.userDeviceRepository.saveDevice(userId, token, platform);
	}

	async getActiveDevices(userId: string) {
		return this.userDeviceRepository.findActiveDevicesByUserId(userId);
	}

	async deactivateDeviceToken(token: string): Promise<void> {
		await this.userDeviceRepository.deactivateToken(token);
	}
}
