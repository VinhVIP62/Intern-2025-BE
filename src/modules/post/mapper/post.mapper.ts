import { Injectable } from '@nestjs/common';
import { Post } from '../entities/post.schema';
import { IProfileRepository } from '@modules/user/repositories/interfaces/profile.repository';
import { IReactRepository } from '../repositories/interfaces/react.repository';
import { TaggedUserMapper } from './taggedUser.mapper';

@Injectable()
export class PostMapper {
	constructor(
		private readonly profileRepo: IProfileRepository,
		private readonly reactRepo: IReactRepository,
		private readonly taggedUserMapper: TaggedUserMapper,
	) {}

	async toResponse(post: Post, userId?: string) {
		const ownerId = post.userId;
		const profile = await this.profileRepo.findById(ownerId);
		const isReacted = userId ? await this.reactRepo.findByUserIdAndPostId(userId, post.id) : null;
		const taggedUsers = await Promise.all(
			post.taggedUserIds.map(
				async taggedUserId => await this.taggedUserMapper.getTaggedUserToResponse(taggedUserId),
			),
		);
		return {
			ownerId: profile.userId,
			ownerFirstName: profile.firstName,
			ownerLastName: profile.lastName,
			ownerAvatar: profile.avatarUrl,
			id: post.id,
			title: post.title,
			content: post.content,
			mediaUrls: post.mediaUrls,
			reactsCount: post.reactsCount,
			commentsCount: post.commentsCount,
			taggedUser: taggedUsers,
			createdAt: post.createdAt,
			updatedAt: post.updatedAt,
			isReacted: isReacted?.type,
			state: post.state,
		};
	}
}
