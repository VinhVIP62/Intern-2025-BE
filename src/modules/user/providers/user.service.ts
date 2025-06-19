import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.schema';

@Injectable()
export class UserService {
	constructor(private readonly userRepository: IUserRepository) {}

	async create(data: Partial<User>): Promise<User> {
		let userData = { ...data };
		if (data.location) {
			userData.location = {
				city: data.location.city ?? '',
				district: data.location.district ?? '',
				address: data.location.address ?? '',
			};
		} else {
			delete userData.location;
		}
		const newUser = this.userRepository.create(userData);
		return newUser;
	}

	async update(id: string, data: Partial<User>): Promise<User> {
		const updatedUser = this.userRepository.update(id, data);
		return updatedUser;
	}

	async findOneByEmail(email: string): Promise<User | null> {
		const foundUser = this.userRepository.findOneByEmail(email);
		return foundUser;
	}
}
