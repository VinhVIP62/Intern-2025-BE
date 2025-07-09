import { Controller, Post, Body, Param, Put, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReactCmtService } from '../providers/react.cmt.service';
import { ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { Response } from '@common/decorators/response.decorator';
import { ReactDto } from '../dto/react.dto';
import { ResponseEntity } from '@common/types';
import { Req } from '@nestjs/common';

@ApiTags('React Comment')
@Controller({
	path: 'reactCmt',
	version: '1',
})
export class ReactCmtController {
	constructor(private readonly reactCmtService: ReactCmtService) {}

	@Post('react/:cmtId')
	@ApiOperation({ summary: 'React cmt' })
	@Response()
	async react(
		@Param('cmtId') cmtId: string,
		@Body() body: ReactDto,
		@Req() req: Request,
	): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const res = await this.reactCmtService.reactCmt(user.id, cmtId, body.type);
		return {
			success: true,
			data: res,
		};
	}

	@Put('update/:cmtId')
	@Response()
	async updateReact(
		@Param('cmtId') cmtId: string,
		@Body() body: ReactDto,
		@Req() req: Request,
	): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const res = await this.reactCmtService.updateReact(user.id, cmtId, body.type);
		return {
			success: true,
			data: res,
		};
	}

	@Post('unreact/:cmtId')
	@ApiOperation({ summary: 'Unreact cmt' })
	@Response()
	async unReact(@Param('cmtId') cmtId: string, @Req() req: Request): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const res = await this.reactCmtService.unReactCmt(user.id, cmtId);
		return {
			success: true,
			data: res,
		};
	}

	@Get('isreacted/:cmtId')
	@Response()
	async isReacted(
		@Param('cmtId') cmtId: string,
		@Req() req: Request,
	): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const isReacted = await this.reactCmtService.isReacted(user.id, cmtId);
		return {
			success: true,
			data: isReacted,
		};
	}
}
