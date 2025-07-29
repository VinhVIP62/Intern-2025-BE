import { Injectable } from '@nestjs/common';
import { Message } from '@modules/chat/entities/message.schema';
import { IMessageRepository } from '@modules/chat/repositories/interface/message.repository';
import { MessageDto } from '../dto/response/message.dto';
import { MessageMapper } from '../mapper/message.mapper';
import { ConversationDto } from '../dto/response/conversation.dto';

@Injectable()
export class ChatService {
	constructor(
		private readonly messageRepository: IMessageRepository,
		private readonly messageMapper: MessageMapper,
	) {}

	async history(myId: string, userId: string, limit = 5, before?: Date): Promise<MessageDto[]> {
		const messages = await this.messageRepository.history(myId, userId, limit, before);
		const res = messages.map(message => this.messageMapper.mapToMessageDto(message));
		return res;
	}

	async conversations(myId: string, limit = 5, before?: Date): Promise<ConversationDto[]> {
		const messages = await this.messageRepository.conversations(myId, limit, before);
		const res = messages.map(message => this.messageMapper.mapToConversationDto(message));
		return res;
	}

	async createMessage(newMsg: Partial<Message>): Promise<MessageDto> {
		const message = await this.messageRepository.create(newMsg);
		return this.messageMapper.mapToMessageDto(message);
	}
}
