import { Injectable } from '@nestjs/common';
import { Post } from '../entities/post.schema';
import { IProfileRepository } from '@modules/user/repositories/profile.repository';

@Injectable()
export class PostMapper {
	constructor(private readonly profileRepo: IProfileRepository) {}
	async toResponse(post: Post) {
		const userId = post.userId;
		const profile = await this.profileRepo.findById(userId);
		return {
			ownerFirstName: profile.firstName,
			ownerLastName: profile.lastName,
			ownerAvatar: profile.avatarUrl,
			id: post.id,
			title: post.title,
			content: post.content,
			mediaUrls: post.mediaUrls,
			reactsCount: post.reactsCount,
			commentsCount: post.commentsCount,
			taggedUserIds: post.taggedUserIds,
			createdAt: post.createdAt,
			updatedAt: post.updatedAt,
		};
	}
}
