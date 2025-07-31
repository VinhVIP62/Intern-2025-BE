import { Body, Controller, Get, Param, Patch, Post, Query, Req, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventService } from '../providers/event.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { Response } from '@common/decorators/response.decorator';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { Request } from 'express';
import { UpdateEventDto } from '../dto/update-event.dto';
import { ResponseEventDto } from '../dto/response-event.dto';
import { UpdateRespondJoinRequestDto } from '../dto/update-respond-join-request.dto';
import { GetJoinRequestsQueryDto } from '../dto/get-join-request-query.dto';
import { ResponsePaging } from '@common/decorators/response-paging.decorator';
import { GetEventsRequestParamDto } from '../dto/get-events-request-param.dto';
import { PaginatedEventResponseDto } from '../dto/paginated-event.dto';
import { PaginatedEventJoinRequestDto } from '../dto/paginated-event-join-request.dto';
import { PaginatedEventInvitationDto } from '../dto/paginated-event-invitation.dto';
import { GetPaginatedParamDto } from '../dto/get-paginated-param.dto';

@ApiTags('Events')
@Controller('events')
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@Version('1')
	@Get('/explore')
	@ApiBearerAuth()
	@ResponsePaging('response.event.explore.success')
	@ApiOperation({ summary: 'Khám phá sự kiện gần bạn (dựa trên location đã lưu)' })
	@ApiResponse({ status: 200, description: 'Lấy thành công', type: PaginatedEventResponseDto })
	async exploreEvents(@Req() req: Request, @Query() query: GetEventsRequestParamDto) {
		const { sportId, creatorId, requiresApproval, page = 1, limit = 10 } = query;

		return this.eventService.getNearbyEventsByUserLocation(
			req.user!.id,
			{
				sportId,
				creatorId,
				requiresApproval,
			},
			page,
			limit,
		);
	}

	@Version('1')
	@Get(':id')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Lấy thông tin chi tiết sự kiện' })
	@ApiResponse({ status: 200, description: 'Lấy thành công', type: ResponseEventDto })
	@Response('response.event.get.detail')
	async getEventDetail(@Param('id') id: string, @Req() req: Request) {
		const event = await this.eventService.getEventDetail(id, req.user!.id);
		return event;
	}

	@Version('1')
	@Post()
	@Roles(Role.USER, Role.MODERATOR, Role.ADMIN)
	@ApiBearerAuth()
	@Response('response.event.create.success')
	@ApiOperation({ summary: 'Tạo sự kiện' })
	@ApiResponse({ status: 201, description: 'Tạo sự kiện thành công' })
	async createEvent(@Req() req: Request, @Body() dto: CreateEventDto) {
		const event = await this.eventService.createEvent(req.user!.id, dto);
		return event;
	}

	@Version('1')
	@Patch(':id')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Cập nhật sự kiện' })
	@ApiResponse({ status: 200, description: 'Cập nhật thành công' })
	@Response('response.event.update.success')
	async updateEvent(@Param('id') id: string, @Req() req: Request, @Body() dto: UpdateEventDto) {
		const updated = await this.eventService.updateEvent(id, req.user!.id, dto);
		return updated;
	}

	@Version('1')
	@Post(':id/join')
	@ApiBearerAuth()
	@Response('response.event.join.success')
	@ApiOperation({ summary: 'Người dùng gửi yêu cầu tham gia sự kiện' })
	@ApiResponse({ status: 200, description: 'Gửi yêu cầu hoặc tham gia thành công' })
	async joinEvent(@Param('id') eventId: string, @Req() req: Request) {
		await this.eventService.requestJoinEvent(eventId, req.user!.id);
	}

	@Version('1')
	@Get(':id/requests')
	@ApiBearerAuth()
	@ResponsePaging('response.event.requests.success')
	@ApiOperation({
		summary: 'Chủ sự kiện lấy danh sách yêu cầu tham gia sự kiện theo status & phân trang',
	})
	@ApiResponse({
		status: 200,
		description: 'Danh sách yêu cầu tham gia',
		type: PaginatedEventJoinRequestDto,
	})
	async getJoinRequests(
		@Param('id') eventId: string,
		@Req() req: Request,
		@Query() query: GetJoinRequestsQueryDto,
	) {
		const { status, page, limit } = query;
		return this.eventService.getJoinRequests(eventId, req.user!.id, status, page, limit);
	}

	@Version('1')
	@Patch(':eventId/requests/:userId/respond')
	@ApiBearerAuth()
	@Response('response.event.respond.success')
	@ApiOperation({ summary: 'Chủ sự kiện phản hồi yêu cầu tham gia sự kiện (accept / reject)' })
	@ApiResponse({ status: 200, description: 'Phản hồi thành công' })
	async respondJoinRequest(
		@Param('eventId') eventId: string,
		@Param('userId') userId: string,
		@Body() dto: UpdateRespondJoinRequestDto,
		@Req() req: Request,
	) {
		return this.eventService.respondJoinRequest(eventId, userId, req.user!.id, dto.status);
	}

	@Version('1')
	@Post(':id/invite/:userId')
	@ApiBearerAuth()
	@Response('response.event.invite.success')
	@ApiOperation({ summary: 'Chủ sự kiện mời người khác tham gia sự kiện' })
	@ApiResponse({ status: 200, description: 'Mời thành công' })
	async inviteUserToEvent(
		@Param('id') eventId: string,
		@Param('userId') targetUserId: string,
		@Req() req: Request,
	) {
		return this.eventService.inviteUserToEvent(eventId, targetUserId, req.user!.id);
	}

	@Version('1')
	@Get('/me/event-invitations')
	@ApiBearerAuth()
	@ResponsePaging('response.event.invitations.success')
	@ApiOperation({ summary: 'Người dùng lấy danh sách lời mời tham gia sự kiện đã nhận' })
	@ApiResponse({ status: 200, description: 'Danh sách lời mời', type: PaginatedEventInvitationDto })
	async getEventInvitations(@Req() req: Request, @Query() query: GetPaginatedParamDto) {
		const { page = 1, limit = 10 } = query;
		return this.eventService.getEventInvitations(req.user!.id, page, limit);
	}

	@Version('1')
	@Patch(':eventId/invitations/respond')
	@ApiBearerAuth()
	@Response('response.event.invitation.respond')
	@ApiOperation({ summary: 'Người dùng phản hồi lời mời tham gia sự kiện (accept/reject)' })
	@ApiResponse({ status: 200, description: 'Phản hồi thành công' })
	async respondInvitation(
		@Param('eventId') eventId: string,
		@Body() dto: UpdateRespondJoinRequestDto,
		@Req() req: Request,
	) {
		return this.eventService.respondInvitation(eventId, req.user!.id, dto.status);
	}

	@Version('1')
	@Get(':id/participants')
	@ApiBearerAuth()
	@ResponsePaging('response.event.participants.success')
	@ApiOperation({ summary: 'Xem danh sách người tham gia sự kiện (accepted)' })
	@ApiResponse({
		status: 200,
		description: 'Danh sách người tham gia sự kiện',
		type: PaginatedEventJoinRequestDto,
	})
	async getEventParticipants(
		@Param('id') eventId: string,
		@Req() req: Request,
		@Query() query: GetPaginatedParamDto,
	) {
		const { page = 1, limit = 10 } = query;
		return this.eventService.getParticipants(eventId, req.user!.id, page, limit);
	}

	@Version('1')
	@Get('/me/events/created')
	@ApiBearerAuth()
	@ResponsePaging('response.event.createdList.success')
	@ApiOperation({ summary: 'Lấy danh sách sự kiện do người dùng tạo' })
	@ApiResponse({
		status: 200,
		description: 'Danh sách sự kiện đã tạo',
		type: PaginatedEventResponseDto,
	})
	async getCreatedEvents(@Req() req: Request, @Query() query: GetPaginatedParamDto) {
		const { page = 1, limit = 10 } = query;
		return this.eventService.getCreatedEvents(req.user!.id, page, limit);
	}

	@Version('1')
	@Get('/me/events/joined')
	@ApiBearerAuth()
	@ResponsePaging('response.event.joinedList.success')
	@ApiOperation({ summary: 'Lấy danh sách sự kiện đã tham gia' })
	@ApiResponse({
		status: 200,
		description: 'Danh sách sự kiện đã tham gia',
		type: PaginatedEventResponseDto,
	})
	async getJoinedEvents(@Req() req: Request, @Query() query: GetPaginatedParamDto) {
		const { page = 1, limit = 10 } = query;
		return this.eventService.getJoinedEvents(req.user!.id, page, limit);
	}
}
