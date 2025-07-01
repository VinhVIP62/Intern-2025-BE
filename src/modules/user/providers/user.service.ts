import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.schema';

@Injectable()
export class UserService {
	constructor(private readonly userRepository: IUserRepository) {}

	async create(data: Partial<User>): Promise<User> {
		const newUser = this.userRepository.create(data);
		return newUser;
	}

	async update(id: string, data: Partial<User>): Promise<User> {
		const updatedUser = this.userRepository.update(id, data);
		return updatedUser;
	}

	async findOneByUsername(username: string): Promise<User | null> {
		const foundUser = this.userRepository.findOneByUsername(username);
		return foundUser;
	}

	async findOneByUsernameOrEmail(username: string, email: string) {
		const foundUser = this.userRepository.findOneByUsernameOrEmail(username, email);
		return foundUser;
	}

	async findOneByEmail(email: string): Promise<User | null> {
		const foundUser = this.userRepository.findOneByEmail(email);
		return foundUser;
	}
}
