import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.schema';
import { ResponseUserDto } from '../dto/user-response.dto';
import { isEmail } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import * as bcrypt from 'bcrypt';
import { isEmailOrPhone } from '@common/utils/check-email-or-phone';
import { FriendService } from 'src/modules/friend/providers/friend.service';
@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly friendService: FriendService,
	) {}

	async create(data: Partial<User>): Promise<ResponseUserDto> {
		const newUser = await this.userRepository.create(data);
		return this.toSafeUserResponse(newUser);
	}

	async update(id: string, data: Partial<User>): Promise<ResponseUserDto> {
		const updatedUser = await this.userRepository.update(id, data);
		return this.toSafeUserResponse(updatedUser);
	}

	async findByEmailOrNumber(accInput: string): Promise<ResponseUserDto | null> {
		const user = await this.userRepository.findByEmailOrNumber(accInput);
		return user ? this.toSafeUserResponse(user) : null;
	}
	async updatePassword(userId: string, password: string) {
		const user = await this.userRepository.findOneById(userId);
		if (user?.password && (await bcrypt.compare(password, user.password))) {
			throw new Error('New password cannot be the same as the old password');
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		return this.userRepository.updatePassword(userId, hashedPassword);
	}

	async addEmail(userId: string, email: string): Promise<ResponseUserDto> {
		const updatedUser = await this.userRepository.addEmail(userId, email);
		return this.toSafeUserResponse(updatedUser);
	}

	async removeEmail(userId: string, email: string, password: string): Promise<ResponseUserDto> {
		//check password
		const isPasswordValid = await this.checkPassword(userId, password);
		if (!isPasswordValid) {
			throw new Error('Invalid password');
		}
		const updatedUser = await this.userRepository.removeEmail(userId, email, password);
		return this.toSafeUserResponse(updatedUser);
	}

	async addPhoneNumber(userId: string, phoneNumber: string): Promise<ResponseUserDto> {
		const updatedUser = await this.userRepository.addPhoneNumber(userId, phoneNumber);
		return this.toSafeUserResponse(updatedUser);
	}

	async removePhoneNumber(userId: string, phoneNumber: string): Promise<ResponseUserDto> {
		const updatedUser = await this.userRepository.removePhoneNumber(userId, phoneNumber);
		return this.toSafeUserResponse(updatedUser);
	}

	async removeContact(userId: string, contact: string, password: string): Promise<ResponseUserDto> {
		const isPasswordValid = await this.checkPassword(userId, password);
		if (!isPasswordValid) {
			throw new Error('Invalid password');
		}
		if (isEmailOrPhone(contact) === 'email') {
			return await this.removeEmail(userId, contact, password);
		} else if (isEmailOrPhone(contact) === 'phone') {
			return await this.removePhoneNumber(userId, contact);
		} else {
			throw new Error('Invalid contact');
		}
	}
	async addContact(userId: string, contact: string): Promise<ResponseUserDto> {
		if (isEmailOrPhone(contact) === 'email') {
			return await this.addEmail(userId, contact);
		} else if (isEmailOrPhone(contact) === 'phone') {
			return await this.addPhoneNumber(userId, contact);
		} else {
			throw new Error('Invalid contact');
		}
	}

	async getUserById(userId: string, MyId?: string): Promise<ResponseUserDto | null> {
		const user = await this.userRepository.findOneById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		if (userId === MyId) {
			return this.toSafeUserResponse(user, 'self');
		}
		const isFriend = MyId ? await this.friendService.isFriend(MyId, userId) : 'self';
		return this.toSafeUserResponse(user, isFriend);
	}
	async getAllUsers(): Promise<ResponseUserDto[]> {
		const users = await this.userRepository.getAllUsers();
		return users.map(user => this.toSafeUserResponse(user));
	}
	async checkPassword(userId: string, password: string): Promise<boolean> {
		return this.userRepository.checkPassword(userId, password);
	}
	/**
	 * Convert User entity to safe response DTO (excluding password and sensitive data)
	 */
	async searchUser(query: string, userId: string) {
		const users = await this.userRepository.search(query);
		return users.map(user => {
			return {
				id: user._id,
				avatar: user.avatar,
				fullName: user.fullName,
				description: user.description,
			};
		});
	}
	toSafeUserResponse(user: User, isFriend?: string): ResponseUserDto {
		return plainToInstance(
			ResponseUserDto,
			{ ...JSON.parse(JSON.stringify(user)), isFriend },
			{
				excludeExtraneousValues: true,
			},
		);
	}
}
