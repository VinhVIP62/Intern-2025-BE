import { ConversationDocument } from '../entities/conversation.schema';
import { Types } from 'mongoose';

export abstract class IConversationRepository {
	abstract findById(id: string): Promise<ConversationDocument | null>;

	abstract findOneByParticipants(userIds: string[]): Promise<ConversationDocument | null>;

	abstract createConversation(
		userId: string,
		userIds: string[],
		isGroup: boolean,
	): Promise<ConversationDocument>;

	abstract updateLastMessage(
		conversationId: string,
		message: {
			text: string;
			sender: Types.ObjectId;
			status: string;
			createdAt: Date;
		},
	): Promise<ConversationDocument | null>;

	abstract findPaginatedByUserId(
		userId: string,
		page: number,
		limit: number,
	): Promise<{ items: ConversationDocument[]; total: number }>;

	abstract updateConversation(
		conversationId: string,
		update: Partial<{ name: string; avatarUrl: string }>,
	): Promise<ConversationDocument | null>;

	abstract addMembers(
		conversationId: string,
		memberIds: string[],
	): Promise<ConversationDocument | null>;

	abstract removeParticipants(
		conversationId: string,
		userIds: string[],
	): Promise<ConversationDocument | null>;
}
