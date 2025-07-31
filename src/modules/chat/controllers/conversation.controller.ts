import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseInterceptors,
	Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ConversationService } from '../providers/conversation.service';
import { Response } from '@common/decorators/response.decorator';
import { ResponseConversationDto } from '../dto/response-conversation.dto';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { GetPaginatedParamDto } from '../dto/get-paginated-param.dto';
import { PaginatedConversationResponseDto } from '../dto/paginated-conversations.dto';
import { UpdateConversationDto } from '../dto/update-conversation.dto';
import { UpdateConversationMemberDto } from '../dto/update-conversation-member.dto';
import { ResponseUserDto } from '@modules/user/dto';
import { GetConversationMembersParamDto } from '../dto/get-conversation-member-param.dto';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationController {
	constructor(private readonly conversationService: ConversationService) {}

	@Version('1')
	@Post()
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.conversation.get_or_create.success')
	@ApiOperation({ summary: 'Tạo cuộc trò chuyện với người dùng khác' })
	@ApiResponse({ status: 200, type: ResponseConversationDto })
	async CreateConversation(
		@Req() req: Request,
		@Body() body: CreateConversationDto,
	): Promise<ResponseConversationDto> {
		const userId = req.user!.id;
		const userIds = [userId, ...body.friendIds];
		return this.conversationService.createConversation(req.user!.id, userIds, body.isGroup);
	}

	@Version('1')
	@Get('me')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.conversation.detail.success')
	@ApiOperation({ summary: 'Lấy phân trang cuộc trò chuyện theo của bản thân' })
	@ApiResponse({ status: 200, type: PaginatedConversationResponseDto })
	async getConversationById(
		@Req() req: Request,
		@Query() query: GetPaginatedParamDto,
	): Promise<{
		items: ResponseConversationDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const { page = 1, limit = 10 } = query;
		return this.conversationService.getConversationByUserId(req.user!.id, page, limit);
	}

	@Version('1')
	@Patch(':conversationId')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.conversation.update.success')
	@ApiOperation({ summary: 'Cập nhật thông tin cuộc trò chuyện (tên/ảnh)' })
	@ApiResponse({ status: 200, type: ResponseConversationDto })
	async updateConversation(
		@Param('conversationId') conversationId: string,
		@Body() body: UpdateConversationDto,
	): Promise<ResponseConversationDto> {
		return this.conversationService.updateConversation(conversationId, body);
	}

	@Version('1')
	@Patch(':conversationId/add-members')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.conversation.add_members.success')
	@ApiOperation({ summary: 'Thêm thành viên vào nhóm' })
	@ApiResponse({ status: 200, type: ResponseConversationDto })
	async addMembersToConversation(
		@Param('conversationId') conversationId: string,
		@Body() body: UpdateConversationMemberDto,
	): Promise<ResponseConversationDto> {
		return this.conversationService.addMembers(conversationId, body.memberIds);
	}

	@Version('1')
	@Patch(':conversationId/leave')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.conversation.leave.success')
	@ApiOperation({ summary: 'Rời khỏi nhóm trò chuyện' })
	@ApiResponse({ status: 200, type: ResponseConversationDto })
	async leaveGroupConversation(
		@Req() req: Request,
		@Param('conversationId') conversationId: string,
	): Promise<ResponseConversationDto> {
		const userId = req.user!.id;
		return this.conversationService.leaveGroupConversation(conversationId, userId);
	}

	@Version('1')
	@Patch(':conversationId/kick')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.conversation.kick.success')
	@ApiOperation({ summary: 'Kick người ra khỏi nhóm trò chuyện (chỉ owner)' })
	@ApiResponse({ status: 200, type: ResponseConversationDto })
	async kickMemberFromGroup(
		@Req() req: Request,
		@Param('conversationId') conversationId: string,
		@Body() dto: UpdateConversationMemberDto,
	): Promise<ResponseConversationDto> {
		return this.conversationService.kickMembers(conversationId, req.user!.id, dto.memberIds);
	}

	@Version('1')
	@Get(':conversationId/members')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@Response('response.conversation.members.success')
	@ApiOperation({ summary: 'Lấy danh sách thành viên trong nhóm trò chuyện' })
	@ApiResponse({ status: 200, type: [ResponseUserDto] }) // bạn có thể định nghĩa DTO riêng
	async getGroupMembers(
		@Req() req: Request,
		@Param() params: GetConversationMembersParamDto,
	): Promise<ResponseUserDto[]> {
		return this.conversationService.getGroupMembers(params.conversationId, req.user!.id);
	}
}
