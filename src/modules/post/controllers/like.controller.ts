import { Body, Controller, Get, Post, Query, Req, UseInterceptors, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LikeService } from '../providers/like.service';
import { CreateLikeDto } from '../dto/create-like.dto';
import { Request } from 'express';
import { Response } from '@common/decorators/response.decorator';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ResponseLikeDto } from '../dto/response-like.dto';
import { Public } from '@common/decorators';
import { ResponsePaging } from '@common/decorators/response-paging.decorator';
import { GetLikesQueryDto } from '../dto/get-like-query.dto';

@ApiTags('Likes')
@Controller('likes')
export class LikeController {
	constructor(private readonly likeService: LikeService) {}

	@Version('1')
	@Post()
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.post.like.toggled')
	@ApiOperation({ summary: 'Tạo hoặc cập nhật like/reaction cho Post hoặc Comment' })
	@ApiResponse({ status: 201, type: ResponseLikeDto })
	async createOrUpdateLike(
		@Req() req: Request,
		@Body() dto: CreateLikeDto,
	): Promise<ResponseLikeDto | null> {
		const userId = req.user!.id;
		return this.likeService.createOrUpdateLike(userId, dto);
	}

	@Version('1')
	@Public()
	@Get()
	@ApiOperation({ summary: 'Lấy danh sách lượt thích theo bài viết hoặc bình luận (phân trang)' })
	@ApiBearerAuth()
	@ApiResponse({ status: 200, type: [ResponseLikeDto] })
	@ResponsePaging('response.post.like.list')
	async getLikesByTarget(@Query() query: GetLikesQueryDto) {
		const { targetId, targetType, ...paging } = query;
		return this.likeService.getLikesByTarget(targetId, targetType, paging);
	}
}
