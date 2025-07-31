import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from '../entities/conversation.schema';
import { IConversationRepository } from '../repositories/conversation.repository';

@Injectable()
export class ConversationRepositoryImpl implements IConversationRepository {
	constructor(
		@InjectModel(Conversation.name)
		private readonly conversationModel: Model<ConversationDocument>,
	) {}

	async findById(id: string): Promise<ConversationDocument | null> {
		return this.conversationModel
			.findById(id)
			.populate('owner', '_id fullName avatarUrl')
			.populate('participants', '_id fullName avatarUrl')
			.populate('lastMessage.sender', '_id fullName avatarUrl')
			.exec();
	}

	async findOneByParticipants(userIds: string[]): Promise<ConversationDocument | null> {
		const sortedIds = userIds.sort();
		return this.conversationModel
			.findOne({
				isGroup: userIds.length > 2,
				participants: { $all: sortedIds, $size: sortedIds.length },
			})
			.exec();
	}

	async createConversation(
		userId: string,
		userIds: string[],
		isGroup: boolean = false,
	): Promise<ConversationDocument> {
		const participantIds = userIds.map(id => new Types.ObjectId(id)).sort();
		const created = new this.conversationModel({
			owner: userId,
			isGroup,
			participants: participantIds,
		});
		return created.save();
	}

	async updateLastMessage(
		conversationId: string,
		message: {
			text: string;
			sender: Types.ObjectId;
			status: string;
			createdAt: Date;
		},
	): Promise<ConversationDocument | null> {
		await this.conversationModel
			.updateOne(
				{ _id: conversationId },
				{
					$set: {
						lastMessage: message,
					},
				},
			)
			.exec();

		const updatedConversation = await this.conversationModel
			.findById(conversationId)
			.populate('owner', '_id fullName avatarUrl')
			.populate('participants', '_id fullName avatarUrl')
			.populate('lastMessage.sender', '_id fullName avatarUrl')
			.exec();

		return updatedConversation;
	}

	async findPaginatedByUserId(
		userId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ items: ConversationDocument[]; total: number }> {
		const filter = {
			participants: new Types.ObjectId(userId),
		};

		const [items, total] = await Promise.all([
			this.conversationModel
				.find(filter)
				.sort({ 'lastMessage.createdAt': -1 }) // Sắp xếp theo thời gian tin nhắn cuối
				.skip((page - 1) * limit)
				.limit(limit)
				.populate('owner', '_id fullName avatarUrl')
				.populate('participants', '_id fullName avatarUrl')
				.populate('lastMessage.sender', '_id fullName avatarUrl')
				.exec(),
			this.conversationModel.countDocuments(filter),
		]);

		return { items, total };
	}

	async updateConversation(
		conversationId: string,
		update: Partial<{ name: string; avatarUrl: string }>,
	): Promise<ConversationDocument | null> {
		return this.conversationModel
			.findByIdAndUpdate(conversationId, update, { new: true })
			.populate('owner', '_id fullName avatarUrl')
			.populate('participants', '_id fullName avatarUrl')
			.populate('lastMessage.sender', '_id fullName avatarUrl')
			.exec();
	}

	async addMembers(
		conversationId: string,
		memberIds: string[],
	): Promise<ConversationDocument | null> {
		const conversation = await this.conversationModel.findById(conversationId).exec();
		if (!conversation || !conversation.isGroup) return null;

		const currentParticipants = conversation.participants.map(id => id.toString());
		const newMembers = memberIds
			.filter(id => !currentParticipants.includes(id))
			.map(id => new Types.ObjectId(id));

		conversation.participants.push(...newMembers);
		await conversation.save();

		return this.conversationModel
			.findById(conversationId)
			.populate('owner', '_id fullName avatarUrl')
			.populate('participants', '_id fullName avatarUrl')
			.populate('lastMessage.sender', '_id fullName avatarUrl')
			.exec();
	}

	async removeParticipants(
		conversationId: string,
		userIds: string[],
	): Promise<ConversationDocument | null> {
		const conversation = await this.conversationModel.findById(conversationId).exec();

		if (!conversation || !conversation.isGroup) return null;

		// Lọc ra những người không bị xoá
		const userIdSet = new Set(userIds.map(id => id.toString()));
		conversation.participants = conversation.participants.filter(
			id => !userIdSet.has(id.toString()),
		);

		// Nếu không còn ai trong nhóm → xoá luôn nhóm
		if (conversation.participants.length === 0) {
			await this.conversationModel.findByIdAndDelete(conversationId).exec();
			return null;
		}

		await conversation.save();

		return this.conversationModel
			.findById(conversationId)
			.populate('owner', '_id fullName avatarUrl')
			.populate('participants', '_id fullName avatarUrl')
			.populate('lastMessage.sender', '_id fullName avatarUrl')
			.exec();
	}
}
