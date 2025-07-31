import { UserDeviceDocument } from '../entities/user-device.entity';

export abstract class IUserDeviceRepository {
	abstract findActiveDevicesByUserId(userId: string): Promise<UserDeviceDocument[]>;

	abstract saveDevice(
		userId: string,
		token: string,
		platform: 'ios' | 'android' | 'web',
	): Promise<void>;

	abstract deactivateToken(token: string): Promise<void>;
}
