import { Injectable, NotFoundException } from '@nestjs/common';
import { ICommentRepository } from '../repositories/interfaces/comment.repository';
import { IPostRepository } from '../repositories/interfaces/post.repository';
import { CreateCommentDto } from '../dto/createComment.dto';
import { CmtMapper } from '../mapper/cmt.mapper';
import { Comment } from '../entities/comment.schema';
import { MentionHelper } from '@common/utils/mention.util';

@Injectable()
export class CommentService {
	constructor(
		private readonly commentRepo: ICommentRepository,
		private readonly postRepo: IPostRepository,
		private readonly cmtMapper: CmtMapper,
	) {}

	async create(userId: string, body: CreateCommentDto) {
		const post = await this.postRepo.findById(body.postId);
		if (!post) throw new NotFoundException('post.NOT_FOUND');

		const parentId = body.parentId ? body.parentId : null;
		let cmt: Comment;
		const taggedUserIds = MentionHelper.extractUserIdsFromContent(body.content);
		if (parentId) {
			const isExistParentCmt = await this.commentRepo.existParent(parentId);
			if (!isExistParentCmt) {
				throw new NotFoundException('post.NOT_FOUND');
			}
			cmt = await this.commentRepo.create({
				userId,
				postId: body.postId,
				parentId: body.parentId,
				content: body.content,
				taggedUserIds: taggedUserIds,
			});
		} else {
			cmt = await this.commentRepo.create({
				userId,
				postId: body.postId,
				content: body.content,
				taggedUserIds: taggedUserIds,
			});
		}
		await this.postRepo.updatePost(body.postId, {
			commentsCount: (post.commentsCount ?? 0) + 1,
		});

		return this.cmtMapper.toRespose(cmt, userId);
	}

	async findByPost(userId: string, postId: string, limit: number = 10, before?: Date) {
		const cmts = await this.commentRepo.findByPostId(postId, limit, before);
		const result = await Promise.all(
			cmts.map(cmt => {
				return this.cmtMapper.toRespose(cmt, userId);
			}),
		);
		return result;
	}

	async findChild(userId: string, parentCmtId: string) {
		const cmts = await this.commentRepo.findChildCmt(parentCmtId);
		const result = await Promise.all(
			cmts.map(cmt => {
				return this.cmtMapper.toRespose(cmt, userId);
			}),
		);
		return result;
	}

	async childCount(cmtId: string) {
		return this.commentRepo.childCount(cmtId);
	}
}
