import { Injectable } from '@nestjs/common';
import { Post } from '../entities/post.schema';
import { IProfileRepository } from '@modules/user/repositories/profile.repository';
import { IReactRepository } from '../repositories/react.repository';

@Injectable()
export class PostMapper {
	constructor(
		private readonly profileRepo: IProfileRepository,
		private readonly reactRepo: IReactRepository,
	) {}
	async toResponse(post: Post, userId?: string) {
		const ownerId = post.userId;
		const profile = await this.profileRepo.findById(ownerId);
		const isReacted = userId ? await this.reactRepo.findByUserIdAndPostId(userId, post.id) : null;
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
			isReacted: isReacted?.type,
		};
	}
}
