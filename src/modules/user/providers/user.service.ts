import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.schema';
import { ResponseProfileDto } from '../dto/response-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { plainToClass } from 'class-transformer';

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

	async updateNewPassword(email: string, newPassword: string): Promise<void> {
		const user = await this.userRepository.findOneByEmail(email);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		user.password = newPassword;
		await user.save();
	}

	async getProfile(userId: string): Promise<ResponseProfileDto> {
		const user = await this.userRepository.findOneById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		// Populate virtual fields to get counts
		await user.populate('friends');
		await user.populate('following');
		await user.populate('followers');
		await user.populate('joinedGroups');

		const profileData = {
			...user.toObject(),
			_id: (user._id as any).toString(), // Convert ObjectId to string, if not, the _id will be change to ObjectId with new user._id
			friendsCount: user.friends?.length || 0,
			followingCount: user.following?.length || 0,
			followersCount: user.followers?.length || 0,
			joinedGroupsCount: user.joinedGroups?.length || 0,
		};

		return plainToClass(ResponseProfileDto, profileData, { excludeExtraneousValues: true });
	}

	async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<ResponseProfileDto> {
		const user = await this.userRepository.findOneById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		// Update user data
		Object.assign(user, updateData);
		await user.save();

		// Return updated profile
		return this.getProfile(userId);
	}
}
