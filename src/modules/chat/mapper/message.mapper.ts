import { Injectable } from '@nestjs/common';
import { Message } from '@modules/chat/entities/message.schema';
import { MessageDto } from '@modules/chat/dto/response/message.dto';
import { ConversationDto } from '@modules/chat/dto/response/conversation.dto';

@Injectable()
export class MessageMapper {
	mapToMessageDto(message: Message): MessageDto {
		return {
			fromUserId: message.fromUserId,
			toUserId: message.toUserId,
			type: message.type,
			refId: message.refId,
			message: message.message,
			createdAt: message.createdAt,
		};
	}

	mapToConversationDto(message: any): ConversationDto {
		return new ConversationDto({
			fromUserId: message.fromUserId,
			toUserId: message.toUserId,
			lastMessage: message.lastMessage,
			lastMessageType: message.lastMessageType,
			lastMessageRefId: message.lastMessageRefId,
			createdAt: message.createdAt,
			userProfile: message.userProfile,
		});
	}
}
