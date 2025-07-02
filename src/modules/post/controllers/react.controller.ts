import { Controller, Post, Param, Req, Body } from '@nestjs/common';
import { ReactService } from '../providers/react.post.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { Response } from '@common/decorators/response.decorator';
import { ReactDto } from '../dto/react.dto';
import { ResponseEntity } from '@common/types';

@ApiTags('Reacts')
@Controller()
export class ReactController {
	constructor(private readonly reactService: ReactService) {}

	@Post('react/:postId')
	@ApiOperation({ summary: 'react bài viết' })
	@Response()
	async react(
		@Param('postId') postId: string,
		@Body() body: ReactDto,
		@Req() req: Request,
	): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const res = await this.reactService.reactPost(user.id, postId, body.type);
		return {
			success: true,
			data: res,
		};
	}

	@Post('unreact/:postId')
	@ApiOperation({ summary: 'Unreact bài viết' })
	@Response()
	async unReact(
		@Param('postId') postId: string,
		@Req() req: Request,
	): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const res = await this.reactService.unReactPost(user.id, postId);
		return {
			success: true,
			data: res,
		};
	}
}
