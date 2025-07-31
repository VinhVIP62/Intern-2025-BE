import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from '../entities/message.schema';
import { IMessageRepository } from './message.repository';

@Injectable()
export class MessageRepositoryImpl implements IMessageRepository {
	constructor(
		@InjectModel(Message.name)
		private readonly messageModel: Model<MessageDocument>,
	) {}

	async create(message: Partial<Message>): Promise<MessageDocument> {
		const created = new this.messageModel(message);
		const saved = await created.save();

		await saved.populate('sender', '_id fullName avatarUrl');
		await saved.populate({
			path: 'replyTo',
			populate: { path: 'sender', select: '_id fullName avatarUrl' },
		});

		return saved;
	}

	async findByConversationId(
		conversationId: string,
		page: number,
		limit: number,
	): Promise<{ items: MessageDocument[]; total: number }> {
		const filter = { conversationId: new Types.ObjectId(conversationId) };
		const [items, total] = await Promise.all([
			this.messageModel
				.find(filter)
				.sort({ createdAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.populate({
					path: 'sender',
					select: '_id fullName avatarUrl',
				})
				.populate({
					path: 'replyTo',
					populate: { path: 'sender', select: '_id fullName avatarUrl' },
				})
				.exec(),
			this.messageModel.countDocuments(filter),
		]);

		const sanitizedItems = items.map(msg => {
			if (msg.isRevoked) {
				msg.text = '';
				msg.media = [];
			}
			return msg;
		});

		return { items: sanitizedItems, total };
	}

	async revokeMessage(messageId: string, userId: string): Promise<MessageDocument | null> {
		const message = await this.messageModel
			.findOneAndUpdate(
				{ _id: new Types.ObjectId(messageId), sender: new Types.ObjectId(userId) },
				{ isRevoked: true },
				{ new: true },
			)
			.populate('sender', '_id fullName avatarUrl');

		return message;
	}
}
