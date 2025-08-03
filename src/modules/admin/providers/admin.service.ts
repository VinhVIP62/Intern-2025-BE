import { NotificationService } from '@modules/notification/providers/notification.service';
import { Injectable } from '@nestjs/common';
import { IUserRepository } from '@modules/user/repositories/interfaces/user.repository';
import { IProfileRepository } from '@modules/user/repositories/interfaces/profile.repository';
import { IPostRepository } from '@modules/post/repositories/interfaces/post.repository';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class AdminService {
	constructor(
		private readonly notiService: NotificationService,
		private readonly userRepo: IUserRepository,
		private readonly profileRepo: IProfileRepository,
		private readonly postRepo: IPostRepository,
	) {}

	getUserSortByReportCount(limit: number, page: number) {
		return this.userRepo.getUserSortByReportCount(limit, page);
	}

	getPostSortByReportCount(limit: number, page: number) {
		return this.postRepo.getPostSortByReportCount(limit, page);
	}

	getDeletedPosts(limit: number, page: number) {
		return this.postRepo.getDeletedPosts(limit, page);
	}

	async deletePost(postId: string) {
		const post = await this.postRepo.findById(postId);
		if (!post) throw new NotFoundException('post.NOT_FOUND');
		await this.postRepo.updatePost(postId, { isDeleted: true });
		return { message: 'post.DELETED' };
	}

	async banUser(userIds: string[]) {
		if (!userIds || userIds.length === 0) {
			return { success: false, message: 'admin.BAN_USER_EMPTY' };
		}

		const users = await this.userRepo.findOneById(userIds[0]);
		if (!users) {
			return { success: false, message: 'admin.USER_NOT_FOUND' };
		}

		await Promise.all(
			userIds.map(async userId => {
				const user = await this.userRepo.findOneById(userId);
				if (!user) throw new NotFoundException('user.NOT_FOUND');
				await this.userRepo.update(userId, { isBanned: true });
			}),
		);

		return { success: true, message: 'admin.BAN_USER_SUCCESS' };
	}

	async unbanUser(userIds: string[]) {
		if (!userIds || userIds.length === 0) {
			return { success: false, message: 'admin.UNBAN_USER_EMPTY' };
		}

		const users = await this.userRepo.findOneById(userIds[0]);
		if (!users) {
			return { success: false, message: 'admin.USER_NOT_FOUND' };
		}

		await Promise.all(
			userIds.map(async userId => {
				const user = await this.userRepo.findOneById(userId);
				if (!user) throw new NotFoundException('user.NOT_FOUND');
				await this.userRepo.update(userId, { isBanned: false });
			}),
		);

		return { success: true, message: 'admin.UNBAN_USER_SUCCESS' };
	}
}
