import { Body, Controller, Delete, Get, Param, Put, Query, Req, Version } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

import { ResponseTransform, Roles } from '@common/decorators';
import { Action, Role } from '@common/enums';
import { AuthenticatedRequest, CursorPaginatedData } from '@common/types/data';
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
	@ResponseTransform({ pagination: true })
	async getCommentReactionUsersList(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Query() query: GetReactionUsersDto,
	): Promise<CursorPaginatedData<ResponseReactionUsersDto>> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const usersListResponse = await this.reactionService.getReactionUsersList(
			postId,
			query.reactionValue,
			query,
		);
		return new CursorPaginatedData(
			usersListResponse.nextCursor,
			plainToInstanceStrict(ResponseReactionUsersDto, usersListResponse.foundUsers),
		);
	}

	@Version('1')
	@Put(':postid/reactions')
	async reactComment(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Req() request: AuthenticatedRequest,
		@Body() body: ReactCommentDto,
	): Promise<ResponseReactionDto> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const reaction = this.reactionService.upsertReaction(
			{ userId: request.user.id, targetId: postId },
			body.reactionValue,
		);
		return plainToInstanceStrict(ResponseReactionDto, reaction);
	}

	@Version('1')
	@Delete(':postid/reactions')
	async unreactComment(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Req() request: AuthenticatedRequest,
	): Promise<ResponseReactionDto> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const reaction = this.reactionService.delete({ userId: request.user.id, targetId: postId });
		return plainToInstanceStrict(ResponseReactionDto, reaction);
	}
}
