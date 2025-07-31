import { Message, MessageDocument } from '../entities/message.schema';

export abstract class IMessageRepository {
	abstract create(message: Partial<Message>): Promise<MessageDocument>;

	abstract findByConversationId(
		conversationId: string,
		page: number,
		limit: number,
	): Promise<{ items: MessageDocument[]; total: number }>;

	abstract revokeMessage(messageId: string, userId: string): Promise<MessageDocument | null>;
}
