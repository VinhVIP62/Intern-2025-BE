import { Controller, Get, Query, Req } from '@nestjs/common';
import { ChatService } from '@modules/chat/providers/chat.service';
import { Request } from 'express';
import { Response } from '@common/decorators/response.decorator';
import { ResponseEntity } from '@common/types';
import { MessageDto } from '../dto/response/message.dto';
import { ConversationDto } from '../dto/response/conversation.dto';

@Controller('chat')
export class ChatController {
	constructor(private chatService: ChatService) {}

	@Get('history')
	@Response()
	async getChatHistory(
		@Req() req: Request,
		@Query('userId') userId: string,
		@Query('limit') limit = 10,
		@Query('before') before: Date,
	): Promise<ResponseEntity<MessageDto[]>> {
		const me = req.user as { id: string };
		const history = await this.chatService.history(me.id, userId, limit, before);
		return {
			success: true,
			data: history,
		};
	}

	@Get('conversations')
	@Response()
	async getConversations(
		@Req() req: Request,
		@Query('limit') limit = 10,
		@Query('before') before: Date,
	): Promise<ResponseEntity<ConversationDto[]>> {
		const me = req.user as { id: string };
		const conversations = await this.chatService.conversations(me.id, limit, before);
		return {
			success: true,
			data: conversations,
		};
	}
}
