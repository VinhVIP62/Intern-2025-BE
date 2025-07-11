import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	Version,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';

import { WithPopulated } from '@common/crud/entities';
import { ResponseTransform, Roles } from '@common/decorators';
import { Action, Role } from '@common/enums';
import { AuthenticatedRequest, CursorPaginatedData } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import { PostService } from '@modules/post/providers';

import { CommentService } from '../../comment/providers';
import { CreateCommentDto, GetCommentsDto, ResponseCommentDto, UpdateCommentDto } from '../dto';

@Roles(Role.USER)
@Controller()
export class PostCommentController {
	constructor(
		private readonly postService: PostService,
		private readonly commentService: CommentService,
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
			userId: request.user.id,
		});
		return plainToInstanceStrict(ResponseCommentDto, createdComment);
	}

	@Version('1')
	@Get(':postid/comments')
	@ResponseTransform({ pagination: true })
	async getDirectComments(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Query() query: GetCommentsDto,
	): Promise<CursorPaginatedData<WithPopulated<ResponseCommentDto>>> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const comments = await this.commentService.getCommentsOf(postId, query);
		return new CursorPaginatedData(
			comments.nextCursor,
			plainToInstanceStrict(ResponseCommentDto, comments.foundComments),
		);
	}

	@Version('1')
	@Get(':postid/comments/count')
	async getDirectCommentsCount(
		@Param('postid', ParseObjectIdPipe) postId: string,
	): Promise<number> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const count = await this.commentService.getCommentsCountOfTarget(postId);
		return count;
	}

	@Version('1')
	@Patch(':postid/comments/:commentid')
	async updateComment(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Param('commentid', ParseObjectIdPipe) commentId: string,
		@Body() body: UpdateCommentDto,
	): Promise<ResponseCommentDto> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const updatedComment = await this.commentService.updateComment(commentId, body);
		return plainToInstanceStrict(ResponseCommentDto, updatedComment);
	}

	@Version('1')
	@Delete(':postid/comments/:commentid')
	async deleteComment(
		@Param('postid', ParseObjectIdPipe) postId: string,
		@Param('commentid', ParseObjectIdPipe) commentId: string,
	): Promise<number> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const deletedComment = await this.commentService.deleteComment(commentId);
		return deletedComment;
	}
}
