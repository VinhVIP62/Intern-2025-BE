import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.schema';
import { ResponseProfileDto } from '../dto/response-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { plainToClass } from 'class-transformer';
import { I18nContext } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';

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

	async updateNewPassword(email: string, newPassword: string, i18n?: I18nContext): Promise<void> {
		const user = await this.userRepository.findOneByEmail(email);
		if (!user) {
			const message = i18n ? i18n.t('user.USER_NOT_FOUND') : 'User not found';
			throw new NotFoundException(message);
		}
		user.password = newPassword;
		await user.save();
	}

	async verifyOldPassword(
		email: string,
		oldPassword: string,
		i18n?: I18nContext,
	): Promise<boolean> {
		const user = await this.userRepository.findOneByEmail(email);
		if (!user) {
			const message = i18n ? i18n.t('user.USER_NOT_FOUND') : 'User not found';
			throw new NotFoundException(message);
		}

		const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
		if (!isPasswordValid) {
			const message = i18n ? i18n.t('user.INVALID_OLD_PASSWORD') : 'Invalid old password';
			throw new UnauthorizedException(message);
		}

		return true;
	}

	async getProfile(userId: string, i18n?: I18nContext): Promise<ResponseProfileDto> {
		const user = await this.userRepository.findOneById(userId);
		if (!user) {
			const message = i18n ? i18n.t('user.USER_NOT_FOUND') : 'User not found';
			throw new NotFoundException(message);
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
			skillLevels: Object.fromEntries(user.skillLevels || []),
		};

		return plainToClass(ResponseProfileDto, profileData, { excludeExtraneousValues: true });
	}

	async updateProfile(
		userId: string,
		updateData: UpdateProfileDto,
		i18n?: I18nContext,
	): Promise<ResponseProfileDto> {
		const user = await this.userRepository.findOneById(userId);
		if (!user) {
			const message = i18n ? i18n.t('user.USER_NOT_FOUND') : 'User not found';
			throw new NotFoundException(message);
		}

		// Update user data
		Object.assign(user, updateData);
		await user.save();

		// Return updated profile
		return this.getProfile(userId, i18n);
	}
}
