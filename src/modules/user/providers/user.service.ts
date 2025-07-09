import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.schema';
import { ResponseUserDto, UpdateUserDto } from '../dto';
import { plainToInstance } from 'class-transformer';
import { BadRequest, Conflict } from '@common/exceptions';
import { FileService } from '@modules/file/providers/file.service';
import { AppLoggerService } from '@common/logger/logger.service';
import { ChangePasswordDto } from '../dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ElasticIndexingService } from '@modules/elastic/elastic-indexing.service';
import { IFriendRepository } from '@modules/friend/repositories/friend.repository';
import { IFriendRequestRepository } from '@modules/friend/repositories/friend-request.repository';

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly fileService: FileService,
		private readonly logger: AppLoggerService,
		private readonly elasticIndexingService: ElasticIndexingService,
		private readonly friendRepository: IFriendRepository,
		private readonly friendRequestRepository: IFriendRequestRepository,
	) {}

	async createUser(data: Partial<User>): Promise<User> {
		if (!data.email?.trim()) {
			throw new BadRequest('validate.auth.email.required');
		}
		const existingUser = await this.userRepository.findByEmail(data.email);
		if (existingUser) {
			throw new Conflict('exception.auth.emailAlreadyExists');
		}
		const newUser = this.userRepository.create(data);
		return newUser;
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userRepository.findByEmail(email);
	}

	async findManyByIds(userIds: string[]): Promise<ResponseUserDto[]> {
		const users = await this.userRepository.findManyByIds(userIds);
		return users.map(user =>
			plainToInstance(ResponseUserDto, user, { excludeExtraneousValues: true }),
		);
	}

	async findById(UserId: string): Promise<User | null> {
		return this.userRepository.findOneById(UserId);
	}

	async getProfile(targetUserId: string, currentUserId: string) {
		const user = await this.userRepository.findOneById(targetUserId);
		const response = plainToInstance(ResponseUserDto, user, { excludeExtraneousValues: true });

		if (currentUserId !== targetUserId) {
			const isFriend = await this.friendRepository.isFriend(currentUserId, targetUserId);
			const outgoing = await this.friendRequestRepository.findPending(currentUserId, targetUserId);
			const incoming = await this.friendRequestRepository.findPending(targetUserId, currentUserId);

			response.isFriend = isFriend;
			response.friendRequestStatus =
				isFriend ? 'friend'
				: outgoing ? 'outgoing_request'
				: incoming ? 'incoming_request'
				: 'none';
		}

		return response;
	}

	async updateProfile(userId: string, dto: UpdateUserDto) {
		const updatedUser = await this.userRepository.updateById(userId, dto);

		try {
			const partialUpdate: Partial<{ fullName: string; bio: string }> = {};
			if (dto.fullName) partialUpdate.fullName = dto.fullName;
			// if (dto.bio) partialUpdate.bio = dto.bio;

			if (Object.keys(partialUpdate).length > 0) {
				await this.elasticIndexingService.updateUser(userId, partialUpdate);
			}
		} catch (err) {
			this.logger.warn(
				`Không thể cập nhật user vào Elasticsearch - ${err instanceof Error ? err.message : String(err)}`,
				UserService.name,
			);
		}

		return plainToInstance(ResponseUserDto, updatedUser, { excludeExtraneousValues: true });
	}

	async updateAvatar(userId: string, avatarUrl: string): Promise<ResponseUserDto> {
		const user = await this.userRepository.findOneById(userId);

		// Nếu có ảnh cũ thì xoá
		if (user.avatarUrl) {
			try {
				const oldAvatarPath = this.fileService.extractFilePathFromPublicUrl(user.avatarUrl);
				await this.fileService.deleteFile(oldAvatarPath);
			} catch (err) {
				this.logger.warn(
					`Không thể xoá avatar cũ: ${user.avatarUrl} - ${err instanceof Error ? err.message : String(err)}`,
					UserService.name,
				);
			}
		}

		// Cập nhật avatar mới
		const updatedUser = await this.userRepository.updateAvatarById(userId, {
			avatarUrl,
		});
		return plainToInstance(ResponseUserDto, updatedUser, { excludeExtraneousValues: true });
	}

	async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
		const user = await this.userRepository.findOneById(userId);

		const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
		if (!isMatch) {
			throw new BadRequest('exception.auth.invalidOldPassword');
		}

		const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

		await this.userRepository.changePasswordById(userId, {
			password: hashedPassword,
		});
	}

	async resetPassword(userId: string, dto: ResetPasswordDto): Promise<void> {
		const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

		await this.userRepository.changePasswordById(userId, {
			password: hashedPassword,
		});
	}
}
