import { Body, Controller, Delete, Get, Param, Put, Query, Version } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

import { Roles } from '@common/decorators';
import { Action, Role } from '@common/enums';
import { CursorPaginatedData, CustomRequestCtx } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import { ReactCommentDto } from '@modules/comment/dto';
import { PostService } from '@modules/post/providers';
import {
	GetReactionUsersDto,
	ResponseReactionDto,
	ResponseReactionUsersDto,
} from '@modules/reaction/dto';
import { ReactionService } from '@modules/reaction/providers';

@Roles(Role.USER)
@Controller()
export class PostReactionController {
	constructor(
		private readonly postService: PostService,
		private readonly reactionService: ReactionService,
	) {}

	@Version('1')
	@Get(':postid/reactions/list')
	async getCommentReactionUsersList(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Query() query: GetReactionUsersDto,
	) {
		await this.postService.checkAccessTo(postId, Action.READ);
		const users = await this.reactionService.getReactionUsersList(
			postId,
			query.reactionValue,
			query,
		);
		return new CursorPaginatedData(
			users.nextCursor,
			plainToInstanceStrict(ResponseReactionUsersDto, users.foundUsers),
		);
	}

	@Version('1')
	@Put(':postid/reactions')
	async reactComment(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Body() body: ReactCommentDto,
	): Promise<ResponseReactionDto> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const user = CustomRequestCtx.getAuthenticated().req.user;
		const reaction = this.reactionService.upsertReaction(
			{ userId: user.id, targetId: postId },
			body.reactionValue,
		);
		return plainToInstanceStrict(ResponseReactionDto, reaction);
	}

	@Version('1')
	@Delete(':postid/reactions')
	async unreactComment(
		@Param('postid', ParseObjectIdPipe) postId: string,
	): Promise<ResponseReactionDto> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const user = CustomRequestCtx.getAuthenticated().req.user;
		const reaction = this.reactionService.delete({ userId: user.id, targetId: postId });
		return plainToInstanceStrict(ResponseReactionDto, reaction);
	}
}
