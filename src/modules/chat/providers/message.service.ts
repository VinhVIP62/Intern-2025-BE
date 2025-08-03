import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateMessageDto } from '../dto/create-message.dto';
import { IMessageRepository } from '../repositories/message.repository';
import { IConversationRepository } from '../repositories/conversation.repository';
import { ResponseMessageDto } from '../dto/response-message.dto';
import { plainToInstance } from 'class-transformer';
import { CreateFirstMessageDto } from '../dto/create-first-message.dto';
import { SocketEventService } from '@modules/realtime/socket-event.service';
import { ResponseConversationDto } from '../dto/response-conversation.dto';
import { mapMimeTypeToType } from '@common/utils/media.util';
import { BlockService } from '@modules/block/providers/block.service';
import { Forbidden } from '@common/exceptions';

@Injectable()
export class MessageService {
	constructor(
		private readonly conversationRepository: IConversationRepository,
		private readonly messageRepository: IMessageRepository,
		private readonly socketEventService: SocketEventService,
		private readonly blockService: BlockService,
	) {}

	async sendFirstMessage(userId: string, dto: CreateFirstMessageDto): Promise<ResponseMessageDto> {
		const userIds = Array.from(new Set([...dto.userIds, userId]));
		const isGroup = userIds.length > 2;

		let conversation = await this.conversationRepository.findOneByParticipants(userIds);

		if (!conversation) {
			conversation = await this.conversationRepository.createConversation(userId, userIds, isGroup);
		}

		if (!conversation.isGroup) {
			const otherParticipants = conversation.participants
				.map(p => p._id.toString())
				.filter(id => id !== userId);

			for (const participantId of otherParticipants) {
				if (await this.blockService.isBlocked(userId, participantId)) {
					throw new Forbidden('Không thể gửi tin nhắn vì đã chặn');
				} else if (await this.blockService.isBlocked(participantId, userId)) {
					throw new Forbidden('Không thể gửi tin nhắn vì đã bị chặn');
				}
			}
		}

		const processedMedia = (dto.media ?? []).map(item => ({
			url: item.url,
			mimeType: item.mimeType,
			type: mapMimeTypeToType(item.mimeType),
		}));

		const saved = await this.messageRepository.create({
			conversationId: conversation._id,
			sender: new Types.ObjectId(userId),
			text: dto.text || '',
			media: processedMedia,
		});

		const updateConversation = await this.conversationRepository.updateLastMessage(
			conversation._id.toString(),
			{
				text: saved.text,
				sender: saved.sender,
				status: saved.status,
				createdAt: saved.createdAt,
			},
		);

		const response = plainToInstance(ResponseMessageDto, saved, { excludeExtraneousValues: true });
		const conversationResponse = plainToInstance(ResponseConversationDto, updateConversation, {
			excludeExtraneousValues: true,
		});

		// Push realtime tới những người còn lại trong cuộc hội thoại
		for (const participant of conversation.participants) {
			const participantId = participant._id.toString();
			// if (participantId !== userId) {
			// 	this.socketEventService.sendConversation(participantId, conversationResponse);
			// }
			this.socketEventService.sendConversation(participantId, conversationResponse);
		}

		return response;
	}

	async sendMessage(userId: string, dto: CreateMessageDto): Promise<ResponseMessageDto> {
		const conversation = await this.conversationRepository.findById(dto.conversationId);
		if (!conversation || !conversation.participants.some(p => p._id.toString() === userId)) {
			throw new Error('Not a participant of the conversation');
		}

		if (!conversation.isGroup) {
			const otherParticipants = conversation.participants
				.map(p => p._id.toString())
				.filter(id => id !== userId);

			for (const participantId of otherParticipants) {
				if (await this.blockService.isBlocked(userId, participantId)) {
					throw new Forbidden('Không thể gửi tin nhắn vì đã chặn');
				} else if (await this.blockService.isBlocked(participantId, userId)) {
					throw new Forbidden('Không thể gửi tin nhắn vì đã bị chặn');
				}
			}
		}

		const processedMedia = (dto.media ?? []).map(item => ({
			url: item.url,
			mimeType: item.mimeType,
			type: mapMimeTypeToType(item.mimeType),
		}));

		const saved = await this.messageRepository.create({
			conversationId: new Types.ObjectId(dto.conversationId),
			sender: new Types.ObjectId(userId),
			text: dto.text || '',
			media: processedMedia,
			replyTo: dto.replyTo ? new Types.ObjectId(dto.replyTo) : undefined,
		});

		await this.conversationRepository.updateLastMessage(dto.conversationId, {
			text: saved.text,
			sender: saved.sender,
			status: saved.status,
			createdAt: saved.createdAt,
		});

		const response = plainToInstance(ResponseMessageDto, saved, { excludeExtraneousValues: true });

		// Push realtime tới những người còn lại trong cuộc hội thoại
		for (const participant of conversation.participants) {
			const participantId = participant._id.toString();
			// if (participantId !== userId) {
			// 	this.socketEventService.sendMessage(participantId, response);
			// }
			this.socketEventService.sendMessage(participantId, response);
		}

		return response;
	}

	async getMessages(
		conversationId: string,
		page = 1,
		limit = 20,
	): Promise<{
		items: ResponseMessageDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const { items, total } = await this.messageRepository.findByConversationId(
			conversationId,
			page,
			limit,
		);

		const data = items.map(message => {
			const plain = plainToInstance(ResponseMessageDto, message, {
				excludeExtraneousValues: true,
			});
			return plain;
		});

		return {
			items: data,
			meta: { total, page, limit },
		};
	}

	async revokeMessage(userId: string, messageId: string): Promise<ResponseMessageDto> {
		const revoked = await this.messageRepository.revokeMessage(messageId, userId);
		if (!revoked) throw new Error('Message not found or not authorized');

		return plainToInstance(ResponseMessageDto, revoked, {
			excludeExtraneousValues: true,
		});
	}
}
