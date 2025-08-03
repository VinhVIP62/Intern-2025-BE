import { Injectable, NotFoundException } from '@nestjs/common';
import { IConversationRepository } from '../repositories/conversation.repository';
import { Types } from 'mongoose';
import { ResponseConversationDto } from '../dto/response-conversation.dto';
import { plainToInstance } from 'class-transformer';
import { BadRequest, EntityNotFound, Forbidden } from '@common/exceptions';
import { UserService } from '@modules/user/providers/user.service';
import { ResponseUserDto } from '@modules/user/dto';

@Injectable()
export class ConversationService {
	constructor(
		private readonly conversationRepository: IConversationRepository,
		private readonly userService: UserService,
	) {}

	async createConversation(
		userId: string,
		userIds: string[],
		isGroup: boolean,
	): Promise<ResponseConversationDto> {
		const conversation = await this.conversationRepository.createConversation(
			userId,
			userIds,
			isGroup,
		);
		return plainToInstance(ResponseConversationDto, conversation, {
			excludeExtraneousValues: true,
		});
	}

	async getConversationByUserId(
		userId: string,
		page: number,
		limit: number,
	): Promise<{
		items: ResponseConversationDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const { items, total } = await this.conversationRepository.findPaginatedByUserId(
			userId,
			page,
			limit,
		);

		const data = items.map(item => {
			const plain = plainToInstance(ResponseConversationDto, item, {
				excludeExtraneousValues: true,
			});

			const participants = item.participants as unknown as {
				_id: string;
				fullName: string;
				avatarUrl: string;
			}[];

			if (item.isGroup) {
				// Nếu chưa có name, tạo name từ tên các user còn lại (trừ current user)
				if (!item.name) {
					const otherUsers = participants.filter(u => u._id.toString() !== userId.toString());
					const names = otherUsers.map(u => u.fullName).join(', ');
					plain.name = names || 'Nhóm không tên';
				}

				// Nếu chưa có avatar, dùng ảnh mặc định
				if (!item.avatarUrl) {
					plain.avatarUrl = 'https://phunugioi.com/wp-content/uploads/2022/02/Avatar-nhom-chat.jpg';
				}
			} else {
				// Chat 1-1
				const otherUser = participants.find(u => u._id.toString() !== userId.toString());

				if (otherUser) {
					plain.name = otherUser.fullName;
					plain.avatarUrl = otherUser.avatarUrl;
				}
			}

			return plain;
		});

		return {
			items: data,
			meta: { total, page, limit },
		};
	}

	async getConversationById(conversationId: string): Promise<ResponseConversationDto> {
		const conversation = await this.conversationRepository.findById(conversationId);
		if (!conversation) throw new NotFoundException('Conversation not found');
		return plainToInstance(ResponseConversationDto, conversation, {
			excludeExtraneousValues: true,
		});
	}

	async updateLastMessage(
		conversationId: string,
		message: {
			text: string;
			sender: Types.ObjectId;
			status: string;
			createdAt: Date;
		},
	): Promise<void> {
		await this.conversationRepository.updateLastMessage(conversationId, message);
	}

	async updateConversation(
		conversationId: string,
		update: Partial<{ name: string; avatarUrl: string }>,
	): Promise<ResponseConversationDto> {
		const conversation = await this.conversationRepository.updateConversation(
			conversationId,
			update,
		);
		if (!conversation) throw new NotFoundException('Conversation not found');
		return plainToInstance(ResponseConversationDto, conversation, {
			excludeExtraneousValues: true,
		});
	}

	async addMembers(conversationId: string, memberIds: string[]): Promise<ResponseConversationDto> {
		const updated = await this.conversationRepository.addMembers(conversationId, memberIds);
		if (!updated) throw new NotFoundException('Conversation not found or is not a group');
		return plainToInstance(ResponseConversationDto, updated, { excludeExtraneousValues: true });
	}

	async leaveGroupConversation(
		conversationId: string,
		userId: string,
	): Promise<ResponseConversationDto> {
		const updated = await this.conversationRepository.removeParticipants(conversationId, [userId]);
		if (!updated) throw new NotFoundException('Conversation not found or not a group');

		return plainToInstance(ResponseConversationDto, updated, {
			excludeExtraneousValues: true,
		});
	}

	async kickMembers(
		conversationId: string,
		currentUserId: string,
		memberIds: string[],
	): Promise<ResponseConversationDto> {
		const conversation = await this.conversationRepository.findById(conversationId);
		if (!conversation) throw new EntityNotFound('Cuộc trò chuyện không tồn tại');

		if (!conversation.isGroup) throw new BadRequest('Không thể kick trong cuộc trò chuyện 1-1');

		if (conversation?.owner?._id.toString() !== currentUserId)
			throw new Forbidden('Bạn không có quyền kick thành viên');

		for (const memberId of memberIds) {
			if (memberId === currentUserId) {
				throw new BadRequest('Không thể tự kick chính mình');
			}

			const isMember = conversation.participants.some(p => p._id.toString() === memberId);
			if (!isMember) {
				throw new EntityNotFound(`Người dùng ${memberId} không có trong cuộc trò chuyện`);
			}
		}

		const updated = await this.conversationRepository.removeParticipants(conversationId, memberIds);
		if (!updated) throw new BadRequest('Không thể xoá thành viên khỏi nhóm');

		return plainToInstance(ResponseConversationDto, updated, {
			excludeExtraneousValues: true,
		});
	}

	async getGroupMembers(conversationId: string, userId: string): Promise<ResponseUserDto[]> {
		const conversation = await this.conversationRepository.findById(conversationId);
		if (!conversation) throw new EntityNotFound('Conversation not found');

		if (!conversation.isGroup) throw new BadRequest('Not a group conversation');

		const isParticipant = conversation.participants.some(p => p._id.toString() === userId);
		if (!isParticipant) throw new Forbidden('You are not a member of this group');

		const users = await this.userService.findManyByIds(
			conversation.participants.map(p => p._id.toString()),
		);

		return users;
	}
}
