import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseInterceptors,
	Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { MessageService } from '../providers/message.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { Response } from '@common/decorators/response.decorator';
import { ResponsePaging } from '@common/decorators/response-paging.decorator';
import { ResponseMessageDto } from '../dto/response-message.dto';
import { GetMessagesQueryDto } from '../dto/get-message-query.dto';
import { CreateFirstMessageDto } from '../dto/create-first-message.dto';

@ApiTags('Messages')
@Controller('messages')
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	@Version('1')
	@Post('first')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.message.sent')
	@ApiOperation({ summary: 'Gửi tin nhắn mới, tạo cuộc trò chuyện với bạn bè' })
	@ApiResponse({ status: 201, type: ResponseMessageDto })
	async sendFirstMessage(
		@Req() req: Request,
		@Body() dto: CreateFirstMessageDto,
	): Promise<ResponseMessageDto> {
		const userId = req.user!.id;
		return this.messageService.sendFirstMessage(userId, dto);
	}

	@Version('1')
	@Post()
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.message.sent')
	@ApiOperation({ summary: 'Gửi tin nhắn trong một cuộc trò chuyện' })
	@ApiResponse({ status: 201, type: ResponseMessageDto })
	async sendMessage(
		@Req() req: Request,
		@Body() dto: CreateMessageDto,
	): Promise<ResponseMessageDto> {
		const userId = req.user!.id;
		return this.messageService.sendMessage(userId, dto);
	}

	@Version('1')
	@Get('conversation/:conversationId')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiParam({ name: 'conversationId', description: 'ID cuộc trò chuyện', type: String })
	@ResponsePaging('response.message.list.success')
	@ApiOperation({ summary: 'Lấy danh sách tin nhắn trong một cuộc trò chuyện (phân trang)' })
	@ApiResponse({ status: 200, type: [ResponseMessageDto] })
	async getMessages(
		@Param('conversationId') conversationId: string,
		@Query() query: GetMessagesQueryDto,
	) {
		const { page = 1, limit = 10 } = query;
		return this.messageService.getMessages(conversationId, page, limit);
	}

	@Version('1')
	@Patch(':id/revoke')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiOperation({ summary: 'Thu hồi tin nhắn (chỉ người gửi được quyền)' })
	@ApiParam({ name: 'id', description: 'ID tin nhắn', type: String })
	@Response('response.message.revoke.success')
	@ApiResponse({ status: 200, type: ResponseMessageDto })
	async revokeMessage(@Param('id') id: string, @Req() req: Request): Promise<ResponseMessageDto> {
		const userId = req.user!.id;
		return this.messageService.revokeMessage(userId, id);
	}
}
