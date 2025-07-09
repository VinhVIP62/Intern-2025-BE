import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Param,
	Post,
	Query,
	Req,
	UseInterceptors,
	Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentService } from '../providers/comment.service';
import { Response } from '@common/decorators/response.decorator';
import { CommentResponseDto } from '../dto/response-comment.dto';
import { ResponsePaging } from '@common/decorators/response-paging.decorator';
import { GetCommentsQueryDto } from '../dto/get-comments-query.dto';
import { Public } from '@common/decorators';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
	constructor(private readonly commentService: CommentService) {}

	@Version('1')
	@Post()
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.post.comment.added')
	@ApiOperation({ summary: 'Tạo bình luận mới cho bài viết hoặc phản hồi bình luận' })
	@ApiResponse({ status: 201, type: CommentResponseDto })
	async createComment(
		@Req() req: Request,
		@Body() dto: CreateCommentDto,
	): Promise<CommentResponseDto> {
		const userId = req.user!.id;
		return this.commentService.createComment(userId, dto);
	}

	@Version('1')
	@Get('post/:postId')
	@Public()
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiParam({ name: 'postId', description: 'ID bài viết', type: String })
	@ResponsePaging('response.comment.list.success')
	@ApiOperation({ summary: 'Lấy danh sách bình luận theo bài viết (phân trang)' })
	@ApiResponse({ status: 200, type: [CommentResponseDto] })
	async getCommentsByPost(
		@Param('postId') postId: string,
		@Query() query: GetCommentsQueryDto,
		@Req() req: Request,
	) {
		const userId = req.user?.id ?? null;
		return this.commentService.getCommentsByPost(postId, userId, query);
	}
}
