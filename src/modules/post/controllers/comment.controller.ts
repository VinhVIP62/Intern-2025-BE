import { Controller, Post, Body, Req, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateCommentDto } from '../dto/createComment.dto';
import { Request } from 'express';
import { CommentService } from '../providers/comment.service';
import { ResponseEntity } from '@common/types';
import { Response } from '@common/decorators/response.decorator';

@ApiTags('Comments')
@Controller({
	path: 'comments',
	version: '1',
})
export class CommentController {
	constructor(private readonly commentService: CommentService) {}

	@Post()
	@Response()
	async create(
		@Body() body: CreateCommentDto,
		@Req() request: Request,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.commentService.create(user.id, body);
		return {
			success: true,
			data: res,
		};
	}

	@Get('/:postId')
	@Response()
	async getCmt(@Param('postId') postId: string): Promise<ResponseEntity<any>> {
		const res = await this.commentService.findByPost(postId);
		return {
			success: true,
			data: res,
		};
	}

	@Get('/:cmtId/childcounts')
	@Response()
	async getChildCount(@Param('cmtId') cmtId: string): Promise<ResponseEntity<any>> {
		const res = await this.commentService.childCount(cmtId);
		return {
			success: true,
			data: res,
		};
	}

	@Get('/replies/:cmtId')
	@Response()
	async getRepliesCmt(@Param('cmtId') cmtId: string): Promise<ResponseEntity<any>> {
		const res = await this.commentService.findChild(cmtId);
		return {
			success: true,
			data: res,
		};
	}
}
