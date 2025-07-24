import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.schema';
import { ResponseProfileDto } from '../dto/response-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { plainToClass } from 'class-transformer';
import { I18nContext } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { SportType, ActivityLevel } from '../enums/user.enum';
import { PaginatedUserBasicInfoResponseDto } from '../dto/user-response.dto';
import { UserBasicInfoDto } from '../dto/user-basic-info.dto';

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

	async getFriendsByKey(userId: string, key: string, page: number, limit: number): Promise<User[]> {
		return this.userRepository.findFriendsByKey(userId, key, page, limit);
	}

	async isFriend(userId: string, otherUserId: string): Promise<boolean> {
		if (userId === otherUserId) return true;
		const user = await this.userRepository.findOneById(userId);
		if (!user) return false;
		return user.friends.map(f => f.toString()).includes(otherUserId);
	}

	async getBasicInfo(
		userId: string,
		i18n?: I18nContext,
	): Promise<{
		userId: string;
		fullName: string;
		avatar: string | null;
	}> {
		const user = await this.userRepository.findOneById(userId);
		if (!user) {
			const message = i18n ? i18n.t('user.USER_NOT_FOUND') : 'User not found';
			throw new NotFoundException(message);
		}

		return {
			userId: (user._id as any).toString(),
			fullName: user.fullName,
			avatar: user.avatar,
		};
	}

	async getBasicInfos(
		userIds: string[],
	): Promise<{ _id: string; firstName: string; lastName: string; avatar: string | null }[]> {
		const users = await this.userRepository.findManyByIds(userIds);
		return users.map(user => ({
			_id: String(user._id as any),
			firstName: user.firstName,
			lastName: user.lastName,
			avatar: user.avatar,
		}));
	}

	async getBasicInfosForPost(
		userIds: string[],
	): Promise<{ userId: string; fullName: string; avatar: string | null }[]> {
		const users = await this.userRepository.findManyByIds(userIds);
		return users.map(user => ({
			userId: String(user._id as any),
			fullName: user.fullName,
			avatar: user.avatar,
		}));
	}

	// FOLLOW/UNFOLLOW
	async followUser(currentUserId: string, targetUserId: string, i18n?: I18nContext): Promise<void> {
		if (currentUserId === targetUserId)
			throw new Error(i18n?.t('user.CANNOT_FOLLOW_SELF') || 'Cannot follow yourself');
		await this.userRepository.followUser(currentUserId, targetUserId);
	}

	async unfollowUser(
		currentUserId: string,
		targetUserId: string,
		i18n?: I18nContext,
	): Promise<void> {
		if (currentUserId === targetUserId)
			throw new Error(i18n?.t('user.CANNOT_UNFOLLOW_SELF') || 'Cannot unfollow yourself');
		await this.userRepository.unfollowUser(currentUserId, targetUserId);
	}

	async getFollowers(
		userId: string,
		key = '',
		page = 1,
		limit = 10,
		i18n?: I18nContext,
	): Promise<PaginatedUserBasicInfoResponseDto> {
		const { total, data } = await this.userRepository.getFollowers(userId, key, page, limit);
		return {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNextPage: page * limit < total,
			hasPrevPage: page > 1,
			data: data.map((u: any) => ({
				userId: u._id?.toString?.() || u.userId || '',
				fullName: u.fullName,
				avatar: u.avatar ?? null,
			})),
		};
	}

	async getFollowing(
		userId: string,
		key = '',
		page = 1,
		limit = 10,
		i18n?: I18nContext,
	): Promise<PaginatedUserBasicInfoResponseDto> {
		const { total, data } = await this.userRepository.getFollowing(userId, key, page, limit);
		return {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNextPage: page * limit < total,
			hasPrevPage: page > 1,
			data: data.map((u: any) => ({
				userId: u._id?.toString?.() || u.userId || '',
				fullName: u.fullName,
				avatar: u.avatar ?? null,
			})),
		};
	}

	// BLOCK/UNBLOCK
	async blockUser(currentUserId: string, targetUserId: string, i18n?: I18nContext): Promise<void> {
		if (currentUserId === targetUserId)
			throw new Error(i18n?.t('user.CANNOT_BLOCK_SELF') || 'Cannot block yourself');
		await this.userRepository.blockUser(currentUserId, targetUserId);
	}

	async unblockUser(
		currentUserId: string,
		targetUserId: string,
		i18n?: I18nContext,
	): Promise<void> {
		if (currentUserId === targetUserId)
			throw new Error(i18n?.t('user.CANNOT_UNBLOCK_SELF') || 'Cannot unblock yourself');
		await this.userRepository.unblockUser(currentUserId, targetUserId);
	}

	async getBlockedUsers(userId: string, i18n?: I18nContext): Promise<any[]> {
		return this.userRepository.getBlockedUsers(userId);
	}

	async removeFollower(
		currentUserId: string,
		followerId: string,
		i18n?: I18nContext,
	): Promise<void> {
		if (currentUserId === followerId)
			throw new Error(i18n?.t('user.CANNOT_REMOVE_SELF') || 'Cannot remove yourself');
		await this.userRepository.removeFollower(currentUserId, followerId);
	}

	async getSkillLevelsByUserId(
		userId: string,
		i18n?: I18nContext,
	): Promise<Map<SportType, ActivityLevel> | null> {
		const user = await this.userRepository.findOneById(userId);
		if (!user) {
			const message = i18n ? i18n.t('user.USER_NOT_FOUND') : 'User not found';
			throw new NotFoundException(message);
		}

		return user.skillLevels || null;
	}

	async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
		await this.userRepository.update(userId, { fcmToken });
	}

	async updateDeviceLanguage(userId: string, deviceLanguage: string): Promise<void> {
		await this.userRepository.update(userId, { deviceLanguage });
	}

	async getUserById(userId: string): Promise<User | null> {
		return this.userRepository.findOneById(userId);
	}
}
