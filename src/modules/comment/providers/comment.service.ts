import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { MemoryStoredFile } from 'nestjs-form-data';

import { WithPopulated } from '@common/crud/entities';
import { Action } from '@common/enums';
import { CursorPaginationOption } from '@common/types/data';

import { ReactionService } from '@modules/reaction/providers';
import { ReactionCount } from '@modules/reaction/repositories';

import {
	CaslFilterFactory,
	FileHostService,
	ISessionService,
	ISessionServiceToken,
	UserAbilityOptions,
} from '@shared/modules';

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
		private readonly reactionService: ReactionService,
		@Inject(ISessionServiceToken) private readonly sessionService: ISessionService<any>,
		private readonly fileHostService: FileHostService,
		private readonly caslFilterFactory: CaslFilterFactory,
	) {}

	async checkAccessTo(id: string, action: Action, options?: UserAbilityOptions): Promise<Comment> {
		const filter = this.caslFilterFactory.createFilterForUser(Comment, action, options);
		const foundComment = this.commentRepository.findOneByOrFail({ id, ...filter }).catch(() => {
			throw new ForbiddenException();
		});
		return foundComment;
	}

	async createComment(
		data: Partial<Comment> & Pick<Comment, 'userId' | 'targetId'> & { files?: MemoryStoredFile[] },
	): Promise<WithPopulated<Comment>> {
		if (data.files) data.fileUrls = await this.fileHostService.files2Urls(data.files);
		const createdComment = this.commentRepository.create(data);
		return createdComment;
	}

	async getCommentsCountOf(targetId: string) {
		return this.commentRepository.count({ targetId });
	}

	async getCommentsCountOfRoot(rootId: string) {
		return this.commentRepository.count({ rootId });
	}

	async getCommentsOf(
		targetId: string,
		options?: CursorPaginationOption<string>,
	): Promise<Promise<PaginatedCommentsWithCursor>> {
		const foundComments = await this.commentRepository.findCommentsCursorPaginated(
			targetId,
			options,
		);
		const reactionCounts = await this.reactionService.getCount(
			foundComments.map(comment => comment.id),
		);
		const reactionCountMap = new Map(reactionCounts.map(rc => [rc.targetId, rc.counts]));
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
		const filter = this.caslFilterFactory.createFilterForUser(Comment, Action.UPDATE);
		await this.sessionService.start();
		const deletedCommentIds = await this.commentRepository.deleteSelfAndDescendants({
			id,
			...filter,
		});
		const deletedReactions = await this.reactionService.deleteMany(deletedCommentIds);
		await this.sessionService.commit();
		await this.sessionService.end();
		return { deletedComments: deletedCommentIds.length, deletedReactions };
	}
}
