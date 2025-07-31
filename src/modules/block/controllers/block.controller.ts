import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	Req,
	UseInterceptors,
	Version,
} from '@nestjs/common';
import { Request } from 'express';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { Response } from '@common/decorators/response.decorator';
import { ResponsePaging } from '@common/decorators/response-paging.decorator';
import { BlockService } from '../providers/block.service';
import { ResponseBlockDto } from '../dto/response-block.dto';
import { CreateBlockDto } from '../dto/create-block.dto';

@ApiTags('Blocked Users')
@Controller('blocked-users')
export class BlockedUserController {
	constructor(private readonly blockService: BlockService) {}

	@Version('1')
	@Post()
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiOperation({ summary: 'Chặn một người dùng với một loại hành vi cụ thể (post, message, etc)' })
	@ApiResponse({ status: 201, type: ResponseBlockDto })
	@Response('response.user.block.success')
	async blockUser(@Req() req: Request, @Body() dto: CreateBlockDto): Promise<ResponseBlockDto> {
		const userId = req.user!.id;
		return this.blockService.blockUser(userId, dto);
	}

	@Version('1')
	@Delete(':id')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiOperation({ summary: 'Bỏ chặn người dùng theo blockType cụ thể' })
	@ApiParam({ name: 'id', description: 'ID người dùng bị chặn', type: String })
	@ApiQuery({
		name: 'type',
		description: 'Loại hành vi bị chặn (post, message, etc)',
		required: true,
	})
	@Response('response.user.unblock.success')
	async unblockUser(
		@Req() req: Request,
		@Param('id') blockedUserId: string,
		@Query('type') blockType: string,
	): Promise<void> {
		const userId = req.user!.id;
		return this.blockService.unblockUser(userId, blockedUserId, blockType);
	}

	@Version('1')
	@Get(':id/check')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiOperation({ summary: 'Kiểm tra xem người dùng đã bị chặn hay chưa (có thể theo loại)' })
	@ApiParam({ name: 'id', description: 'ID người cần kiểm tra', type: String })
	@ApiQuery({ name: 'type', required: false, description: 'Loại block (post, message, etc)' })
	@Response('response.user.block.check')
	@ApiResponse({ status: 200, type: Boolean })
	async isBlocked(
		@Req() req: Request,
		@Param('id') otherUserId: string,
		@Query('type') type?: string,
	): Promise<boolean> {
		const userId = req.user!.id;
		return this.blockService.isBlocked(userId, otherUserId, type);
	}

	@Version('1')
	@Get()
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiQuery({ name: 'type', required: false, description: 'Lọc theo loại block' })
	@ResponsePaging('response.user.block.list.success')
	@ApiOperation({ summary: 'Lấy danh sách người dùng bị chặn (có thể lọc theo loại)' })
	@ApiResponse({ status: 200, type: [ResponseBlockDto] })
	async getBlockedUsers(
		@Req() req: Request,
		@Query('type') type?: string,
	): Promise<ResponseBlockDto[]> {
		const userId = req.user!.id;
		return this.blockService.getBlockedUsers(userId, type);
	}
}
