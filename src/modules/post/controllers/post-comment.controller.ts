import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
	Query,
	Req,
	Version,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';

import { WithPopulated } from '@common/crud/entities';
import { ResponseTransform, Roles } from '@common/decorators';
import { Action, Role } from '@common/enums';
import { AuthenticatedRequest, CursorPaginatedData, CustomRequestCtx } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import {
	CreateCommentDto,
	GetCommentsDto,
	ReactCommentDto,
	ResponseCommentDetailedDto,
	ResponseCommentDto,
	UpdateCommentDto,
} from '@modules/comment/dto';
import { PostService } from '@modules/post/providers';
import {
	GetReactionUsersDto,
	ResponseReactionDto,
	ResponseReactionUsersDto,
} from '@modules/reaction/dto';
import { ReactionService } from '@modules/reaction/providers';

import { CommentService, DeletedCommentsSummary } from '../../comment/providers';

@Roles(Role.USER)
@Controller()
export class PostCommentController {
	constructor(
		private readonly postService: PostService,
		private readonly commentService: CommentService,
		private readonly reactionService: ReactionService,
	) {}

	@Version('1')
	@Post(':postid/comments')
	@FormDataRequest({ storage: MemoryStoredFile })
	async createComment(
		@Body() body: CreateCommentDto,
		@Req() request: AuthenticatedRequest,
		@Param('postid', ParseObjectIdPipe) postId: string,
	): Promise<ResponseCommentDto> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const createdComment = await this.commentService.createComment({
			...body,
			postId,
			targetId: postId,
			userId: request.user.id,
		});
		return plainToInstanceStrict(ResponseCommentDto, createdComment);
	}

	@Version('1')
	@Get(':postid/comments')
	@ResponseTransform({ pagination: true })
	async getComments(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Query() query: GetCommentsDto,
	): Promise<CursorPaginatedData<WithPopulated<ResponseCommentDto>>> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const comments = await this.commentService.getCommentsOf(postId, query);
		return new CursorPaginatedData(
			comments.nextCursor,
			plainToInstanceStrict(ResponseCommentDetailedDto, comments.foundComments),
		);
	}

	@Version('1')
	@Get(':postid/comments/count')
	async getCommentsCount(@Param('postid', ParseObjectIdPipe) postId: string): Promise<number> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const count = await this.commentService.getCommentsCountOfTarget(postId);
		return count;
	}

	@Version('1')
	@Get(':postid/comments/:commentid/replies')
	@ResponseTransform({ pagination: true })
	async getReplies(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Param('commentid', ParseObjectIdPipe) commentId: string,
		@Query() query: GetCommentsDto,
	): Promise<CursorPaginatedData<WithPopulated<ResponseCommentDto>>> {
		await this.postService.checkAccessTo(postId, Action.READ);
		await this.commentService.checkAccessTo(commentId, Action.READ);
		const comments = await this.commentService.getCommentsOf(commentId, query);
		return new CursorPaginatedData(
			comments.nextCursor,
			plainToInstanceStrict(ResponseCommentDto, comments.foundComments),
		);
	}

	@Version('1')
	@Patch(':postid/comments/:commentid')
	@FormDataRequest({ storage: MemoryStoredFile })
	async updateComment(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Param('commentid', ParseObjectIdPipe) commentId: string,
		@Body() body: UpdateCommentDto,
	): Promise<ResponseCommentDto> {
		await this.postService.checkAccessTo(postId, Action.READ);
		await this.commentService.checkAccessTo(commentId, Action.UPDATE);
		const updatedComment = await this.commentService.updateComment(commentId, body);
		return plainToInstanceStrict(ResponseCommentDto, updatedComment);
	}

	@Version('1')
	@Delete(':postid/comments/:commentid')
	async deleteComment(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Param('commentid', ParseObjectIdPipe) commentId: string,
	): Promise<DeletedCommentsSummary> {
		await this.postService.checkAccessTo(postId, Action.READ);
		await this.commentService.checkAccessTo(commentId, Action.DELETE);
		const deletedComment = await this.commentService.deleteComment(commentId);
		return deletedComment;
	}

	@Version('1')
	@Get(':postid/comments/:commentid/reactions/list')
	async getCommentReactionUsersList(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Param('commentid', ParseObjectIdPipe) commentId: string,
		@Query() query: GetReactionUsersDto,
	) {
		await this.postService.checkAccessTo(postId, Action.READ);
		await this.commentService.checkAccessTo(commentId, Action.READ);
		const users = await this.reactionService.getReactionUsersList(
			commentId,
			query.reactionValue,
			query,
		);
		return new CursorPaginatedData(
			users.nextCursor,
			plainToInstanceStrict(ResponseReactionUsersDto, users.foundUsers),
		);
	}

	@Version('1')
	@Put(':postid/comments/:commentid/reactions')
	async reactComment(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Param('commentid', ParseObjectIdPipe) commentId: string,
		@Body() body: ReactCommentDto,
	): Promise<ResponseReactionDto> {
		await this.postService.checkAccessTo(postId, Action.READ);
		await this.commentService.checkAccessTo(commentId, Action.READ);
		const user = CustomRequestCtx.getAuthenticated().req.user;
		const reaction = this.reactionService.upsertReaction(
			{ userId: user.id, targetId: commentId },
			body.reactionValue,
		);
		return plainToInstanceStrict(ResponseReactionDto, reaction);
	}

	@Version('1')
	@Delete(':postid/comments/:commentid/reactions')
	async unreactComment(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Param('commentid', ParseObjectIdPipe) commentId: string,
	): Promise<ResponseReactionDto> {
		await this.postService.checkAccessTo(postId, Action.READ);
		await this.commentService.checkAccessTo(commentId, Action.READ);
		const user = CustomRequestCtx.getAuthenticated().req.user;
		const reaction = this.reactionService.delete({ userId: user.id, targetId: commentId });
		return plainToInstanceStrict(ResponseReactionDto, reaction);
	}
}
