import { accessibleBy } from '@casl/mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { MemoryStoredFile } from 'nestjs-form-data';

import { WithPopulated } from '@common/crud/entities';
import { Action } from '@common/enums';
import { CursorPaginationOption, CustomRequestCtx } from '@common/types/data';

import { IPostRepository, IPostRepositoryToken } from '@modules/post/repositories';

import { CaslAbilityFactory, FileHostService } from '@shared/modules';

import { Comment } from '../entities';
import { ICommentRepository, ICommentRepositoryToken } from '../repositories';

@Injectable()
export class CommentService {
	constructor(
		@Inject(ICommentRepositoryToken) private readonly commentRepository: ICommentRepository,
		@Inject(IPostRepositoryToken) private readonly postRepository: IPostRepository,
		private readonly fileHostService: FileHostService,
		private readonly caslAbilityFactory: CaslAbilityFactory,
	) {}

	// create, read doesn't require authorization, authorization is done on whatever module imports the service
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
	): Promise<
		Promise<{
			foundComments: WithPopulated<Comment>[];
			nextCursor: string;
		}>
	> {
		const foundComments = await this.commentRepository.findCommentsCursorPaginated(
			targetId,
			options,
		);
		const nextCursor = foundComments.at(-1)?.id || '';
		return { foundComments, nextCursor };
	}

	// update, delete requires user to own the comment
	async updateComment(
		id: string,
		data: Partial<Pick<Comment, 'content' | 'fileUrls'>> & { files?: MemoryStoredFile[] },
	): Promise<WithPopulated<Comment>> {
		// generate query
		const user = CustomRequestCtx.getAuthenticated().req.user;
		const ability = this.caslAbilityFactory.createForUser(user);
		const filter = accessibleBy(ability, Action.UPDATE).ofType(Comment);
		// operations
		if (data.files) data.fileUrls = await this.fileHostService.files2Urls(data.files);
		const updatedComment = this.commentRepository.findOneByAndUpdate({ id, ...filter }, data);
		return updatedComment;
	}

	async deleteComment(id: string): Promise<number> {
		// generate query
		const user = CustomRequestCtx.getAuthenticated().req.user;
		const ability = this.caslAbilityFactory.createForUser(user);
		const filter = accessibleBy(ability, Action.DELETE).ofType(Comment);
		// operations
		const deletedComment = this.commentRepository.deleteSelfAndDescendants({ id, ...filter });
		return deletedComment;
	}
}
