import { Message } from '@modules/chat/entities/message.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { IMessageRepository } from '@modules/chat/repositories/interface/message.repository';

@Injectable()
export class MessageRepositoryImpl implements IMessageRepository {
	constructor(@InjectModel(Message.name) private chatModel: Model<Message>) {}

	async create(newMsg: Partial<Message>): Promise<Message> {
		return this.chatModel.create(newMsg);
	}

	async history(myId: string, userId: string, limit: number, before?: Date): Promise<Message[]> {
		const query: FilterQuery<Message> = {
			$or: [
				{ fromUserId: myId, toUserId: userId },
				{ fromUserId: userId, toUserId: myId },
			],
		};
		if (before) {
			query.createdAt = { $lt: before };
		}
		return this.chatModel.find(query).limit(limit).sort({ createdAt: 1 });
	}

	async conversations(myId: string, limit: number, before?: Date): Promise<any[]> {
		const matchStage: FilterQuery<Message> = {
			$or: [{ fromUserId: myId }, { toUserId: myId }],
		};

		if (before) {
			matchStage.createdAt = { $lt: before };
		}

		return this.chatModel.aggregate([
			{ $match: matchStage },

			{
				$addFields: {
					conversationKey: {
						$cond: [{ $eq: ['$fromUserId', myId] }, '$toUserId', '$fromUserId'],
					},
				},
			},

			{ $sort: { createdAt: -1 } },

			{
				$group: {
					_id: '$conversationKey',
					lastMessage: { $first: '$$ROOT' },
				},
			},

			{ $replaceRoot: { newRoot: '$lastMessage' } },

			{
				$lookup: {
					from: 'profiles',
					localField: 'conversationKey',
					foreignField: 'userId',
					as: 'userProfile',
				},
			},
			{ $unwind: '$userProfile' },

			{
				$project: {
					fromUserId: '$fromUserId',
					toUserId: '$toUserId',
					lastMessage: '$message',
					lastMessageType: '$type',
					lastMessageRefId: '$refId',
					createdAt: '$createdAt',
					userProfile: {
						id: '$userProfile.userId',
						firstName: '$userProfile.firstName',
						lastName: '$userProfile.lastName',
						avatarUrl: '$userProfile.avatarUrl',
					},
				},
			},

			{ $sort: { createdAt: -1 } },

			{ $limit: limit },
		]);
	}
}
