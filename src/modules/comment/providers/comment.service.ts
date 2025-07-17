import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MemoryStoredFile } from 'nestjs-form-data';

import { WithPopulated } from '@common/crud/entities';
import { Action } from '@common/enums';
import { CursorPaginationOption, CustomRequestCtx } from '@common/types/data';

import {
	IReactionRepository,
	IReactionRepositoryToken,
	ReactionCount,
} from '@modules/reaction/repositories';

import { CaslFilterFactory, FileHostService } from '@shared/modules';

import { Comment } from '../entities';
import { ICommentRepository, ICommentRepositoryToken } from '../repositories';

export type DeletedCommentsSummary = { deletedComments: number; deletedReactions: number };

export type PaginatedCommentsWithCursor = {
	foundComments: (WithPopulated<Comment> & Pick<ReactionCount, 'counts'>)[];
	nextCursor: string;
};

@Injectable()
export class CommentService {
	constructor(
		@Inject(ICommentRepositoryToken) private readonly commentRepository: ICommentRepository,
		@Inject(IReactionRepositoryToken) private readonly reactionRepository: IReactionRepository,
		@InjectConnection() private connection: Connection,
		private readonly fileHostService: FileHostService,
		private readonly caslFilterFactory: CaslFilterFactory,
	) {}

	async checkAccessTo(id: string, action: Action): Promise<void> {
		const filter = this.caslFilterFactory.createFilterForUser(Comment, action);
		await this.commentRepository.findOneByOrFail({ id, ...filter }).catch(() => {
			throw new ForbiddenException();
		});
	}

	async createComment(
		data: Partial<Comment> & Pick<Comment, 'userId' | 'targetId'> & { files?: MemoryStoredFile[] },
	): Promise<WithPopulated<Comment>> {
		if (data.files) data.fileUrls = await this.fileHostService.files2Urls(data.files);
		const createdComment = this.commentRepository.create(data);
		return createdComment;
	}

	async getCommentsCountOfTarget(targetId: string) {
		return this.commentRepository.count({ targetId });
	}

	async getCommentsOf(
		targetId: string,
		options?: CursorPaginationOption<string>,
	): Promise<Promise<PaginatedCommentsWithCursor>> {
		const foundComments = await this.commentRepository.findCommentsCursorPaginated(
			targetId,
			options,
		);
		const reactionCounts = await this.reactionRepository.getCount(
			foundComments.map(comment => comment.id),
		);
		// targetId toString because it's actually objectid
		const reactionCountMap = new Map(reactionCounts.map(rc => [rc.targetId.toString(), rc.counts]));
		const commentsWithReactions = foundComments.map(comment => ({
			...comment,
			counts: reactionCountMap.get(comment.id) || [],
		}));
		const nextCursor = foundComments.at(-1)?.id || '';
		return { foundComments: commentsWithReactions, nextCursor };
	}

	async updateComment(
		id: string,
		data: Partial<Pick<Comment, 'content' | 'fileUrls'>> & { files?: MemoryStoredFile[] },
	): Promise<WithPopulated<Comment>> {
		const filter = this.caslFilterFactory.createFilterForUser(Comment, Action.UPDATE);
		if (data.files) data.fileUrls = await this.fileHostService.files2Urls(data.files);
		const updatedComment = this.commentRepository.findOneByAndUpdate({ id, ...filter }, data);
		return updatedComment;
	}

	async deleteComment(id: string): Promise<DeletedCommentsSummary> {
		const requestCtx = CustomRequestCtx.getAuthenticated().req;
		const filter = this.caslFilterFactory.createFilterForUser(Comment, Action.UPDATE);
		const session = await this.connection.startSession();
		requestCtx.db.mongoose.session = session;
		session.startTransaction();
		const deletedCommentIds = await this.commentRepository.deleteSelfAndDescendants({
			id,
			...filter,
		});
		const deletedReactions = await this.reactionRepository.deleteManyOf(deletedCommentIds);
		await session.endSession();
		requestCtx.db.mongoose.session = null;
		return { deletedComments: deletedCommentIds.length, deletedReactions };
	}
}
