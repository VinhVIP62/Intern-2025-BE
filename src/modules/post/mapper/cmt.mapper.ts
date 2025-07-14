import { Injectable } from '@nestjs/common';
import { Comment } from '../entities/comment.schema';
import { IProfileRepository } from '@modules/user/repositories/profile.repository';
import { ICommentRepository } from '../repositories/comment.repository';
import { IReactCommentRepository } from '../repositories/react.comment.repository';

@Injectable()
export class CmtMapper {
	constructor(
		private readonly profileRepo: IProfileRepository,
		private readonly cmtRepo: ICommentRepository,
		private readonly reactRepo: IReactCommentRepository,
	) {}
	async toRespose(cmt: Comment, userId?: string) {
		const profile = await this.profileRepo.findById(cmt.userId);
		const childCount = await this.cmtRepo.childCount(cmt.id);
		const isReacted = userId ? await this.reactRepo.findByUserIdAndCmtId(userId, cmt.id) : null;
		return {
			id: cmt.id,
			parentId: cmt.parentId,
			content: cmt.content,
			reactCount: cmt.reactsCount,
			ownerFirstName: profile.firstName,
			ownerLastName: profile.lastName,
			ownerAvatar: profile.avatarUrl,
			childCount: childCount,
			isReacted: isReacted?.type,
		};
	}
}
