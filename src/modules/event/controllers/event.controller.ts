import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
	Query,
	HttpException,
	HttpStatus,
	UseGuards,
	Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { EventService } from '@modules/event/providers/event.service';
import {
	CreateEventDto,
	UpdateEventDto,
	EventResponseDto,
	PaginatedEventsResponseDto,
	InviteUsersToEventDto,
	EventInvitationResponseDto,
	PaginatedEventInvitationsResponseDto,
	PaginatedUserEventsResponseDto,
} from '@modules/event/dto';
import { SportType } from '@modules/user/enums/user.enum';
import {
	JoinEventDto,
	LeaveEventDto,
	PaginatedEventParticipantsResponseDto,
	EventParticipantDto,
} from '@modules/event/dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { RSVPStatus } from '@modules/event/entities/event.enum';
import { EventInvitationStatus } from '@modules/event/entities/event.enum';
import { PaginationQuery } from '@common/decorators/pagination-query.decorator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
@ApiTags('Event')
@Controller('events')
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@Post()
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Tạo sự kiện mới' })
	@ApiBody({ type: CreateEventDto })
	@ApiResponse({ status: 201, description: 'Tạo sự kiện thành công', type: EventResponseDto })
	@ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
	async createEvent(
		@Request() req,
		@Body() createEventDto: CreateEventDto,
		@I18n() i18n: I18nContext,
	) {
		try {
			const event = await this.eventService.createEvent(
				{
					...createEventDto,
					startDate: new Date(createEventDto.startDate),
					endDate: new Date(createEventDto.endDate),
				},
				req.user.id,
			);
			return {
				success: true,
				data: event,
				message: i18n.t('event.EVENT_CREATED_SUCCESS'),
			};
		} catch (error) {
			throw new HttpException(
				{
					success: false,
					message: i18n.t('event.EVENT_CREATION_FAILED'),
				},
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	@Get()
	@ApiOperation({
		summary: 'Lấy danh sách sự kiện',
		description:
			'Lấy danh sách sự kiện với thông tin chi tiết. Nếu organizerType là GROUP, sẽ bao gồm danh sách admin của nhóm.',
	})
	@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
	@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
	@ApiQuery({ name: 'sport', required: false, enum: Object.values(SportType) })
	@ApiResponse({
		status: 200,
		description:
			'Lấy danh sách sự kiện thành công. Organizer sẽ bao gồm danh sách admin nếu là Group.',
		type: PaginatedEventsResponseDto,
	})
	async getAllEvents(
		@I18n() i18n: I18nContext,
		@PaginationQuery(PaginationQueryDto) query: PaginationQueryDto,
		@Query('sport') sport?: string,
	) {
		const q: any = {}; // q is query object
		if (sport) q.sport = sport;
		const { events, total } = await this.eventService.getAllEvents(q, {
			page: query.page ?? 1,
			limit: query.limit ?? 10,
		});
		return {
			success: true,
			data: {
				events,
				total,
				page: query.page ?? 1,
				limit: query.limit ?? 10,
				totalPages: Math.ceil(total / (query.limit ?? 10)),
				hasNextPage: (query.page ?? 1) * (query.limit ?? 10) < total,
				hasPrevPage: (query.page ?? 1) > 1,
			},
			message: i18n.t('event.EVENTS_RETRIEVED_SUCCESS'),
		};
	}

	@Get(':eventId')
	@ApiOperation({
		summary: 'Lấy chi tiết sự kiện theo ID',
		description:
			'Lấy thông tin chi tiết sự kiện. Nếu organizerType là GROUP, sẽ bao gồm danh sách admin của nhóm.',
	})
	@ApiParam({ name: 'eventId', description: 'ID sự kiện', example: '507f1f77bcf86cd799439011' })
	@ApiResponse({
		status: 200,
		description: 'Lấy sự kiện thành công. Organizer sẽ bao gồm danh sách admin nếu là Group.',
		type: EventResponseDto,
	})
	@ApiResponse({ status: 404, description: 'Không tìm thấy sự kiện' })
	async getEventById(@Param('eventId') eventId: string, @I18n() i18n: I18nContext) {
		const event = await this.eventService.getEventById(eventId);
		if (!event) {
			throw new HttpException(
				{
					success: false,
					message: i18n.t('event.EVENT_NOT_FOUND'),
				},
				HttpStatus.NOT_FOUND,
			);
		}
		return {
			success: true,
			data: event,
			message: i18n.t('event.EVENT_RETRIEVED_SUCCESS'),
		};
	}

	@Put(':eventId')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({
		summary: 'Cập nhật sự kiện',
		description:
			'Cập nhật thông tin sự kiện. Nếu organizerType là GROUP, response sẽ bao gồm danh sách admin của nhóm.',
	})
	@ApiParam({ name: 'eventId', description: 'ID sự kiện', example: '507f1f77bcf86cd799439011' })
	@ApiBody({ type: UpdateEventDto })
	@ApiResponse({
		status: 200,
		description: 'Cập nhật sự kiện thành công. Organizer sẽ bao gồm danh sách admin nếu là Group.',
		type: EventResponseDto,
	})
	@ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
	@ApiResponse({ status: 404, description: 'Không tìm thấy sự kiện' })
	async updateEvent(
		@Param('eventId') eventId: string,
		@Body() updateEventDto: UpdateEventDto,
		@I18n() i18n: I18nContext,
	) {
		const event = await this.eventService.updateEvent(eventId, updateEventDto);
		if (!event) {
			throw new HttpException(
				{
					success: false,
					message: i18n.t('event.EVENT_NOT_FOUND'),
				},
				HttpStatus.NOT_FOUND,
			);
		}
		return {
			success: true,
			data: event,
			message: i18n.t('event.EVENT_UPDATED_SUCCESS'),
		};
	}

	@Delete(':eventId')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Xóa sự kiện' })
	@ApiParam({ name: 'eventId', description: 'ID sự kiện', example: '507f1f77bcf86cd799439011' })
	@ApiResponse({ status: 200, description: 'Xóa sự kiện thành công' })
	@ApiResponse({ status: 404, description: 'Không tìm thấy sự kiện' })
	@ApiResponse({ status: 403, description: 'Không có quyền xóa sự kiện' })
	async deleteEvent(@Request() req, @Param('eventId') eventId: string, @I18n() i18n: I18nContext) {
		await this.eventService.deleteEventWithPermission(eventId, req.user.id, i18n);
		return {
			success: true,
			message: i18n.t('event.EVENT_DELETED_SUCCESS'),
		};
	}

	@Post(':eventId/join')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({
		summary: 'Tham gia sự kiện',
		description:
			'Tham gia sự kiện. Response sẽ bao gồm thông tin sự kiện với organizer (bao gồm admin nếu là Group).',
	})
	@ApiParam({ name: 'eventId', description: 'ID sự kiện', example: '507f1f77bcf86cd799439011' })
	@ApiResponse({
		status: 200,
		description: 'Tham gia sự kiện thành công. Organizer sẽ bao gồm danh sách admin nếu là Group.',
	})
	@ApiResponse({ status: 400, description: 'Tham gia sự kiện thất bại' })
	async joinEvent(@Request() req, @Param('eventId') eventId: string, @I18n() i18n: I18nContext) {
		try {
			await this.eventService.joinEvent(eventId, req.user.id);
			return {
				success: true,
				message: i18n.t('event.JOIN_SUCCESS'),
			};
		} catch (error) {
			return {
				success: false,
				message: i18n.t('event.JOIN_FAILED'),
			};
		}
	}

	@Delete(':eventId/leave')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({
		summary: 'Rời sự kiện',
		description:
			'Rời khỏi sự kiện. Response sẽ bao gồm thông tin sự kiện với organizer (bao gồm admin nếu là Group).',
	})
	@ApiParam({ name: 'eventId', description: 'ID sự kiện', example: '507f1f77bcf86cd799439011' })
	@ApiResponse({
		status: 200,
		description: 'Rời sự kiện thành công. Organizer sẽ bao gồm danh sách admin nếu là Group.',
	})
	@ApiResponse({ status: 400, description: 'Rời sự kiện thất bại' })
	async leaveEvent(@Request() req, @Param('eventId') eventId: string, @I18n() i18n: I18nContext) {
		try {
			await this.eventService.leaveEvent(eventId, req.user.id);
			return {
				success: true,
				message: i18n.t('event.LEAVE_SUCCESS'),
			};
		} catch (error) {
			return {
				success: false,
				message: i18n.t('event.LEAVE_FAILED'),
			};
		}
	}

	@Put(':eventId/rsvp')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({
		summary: 'RSVP sự kiện',
		description:
			'Đánh dấu trạng thái tham gia sự kiện. Response sẽ bao gồm thông tin sự kiện với organizer (bao gồm admin nếu là Group).',
	})
	@ApiParam({ name: 'eventId', description: 'ID sự kiện', example: '507f1f77bcf86cd799439011' })
	@ApiQuery({ name: 'status', required: true, enum: ['going', 'interested', 'not_going'] })
	@ApiResponse({
		status: 200,
		description: 'RSVP thành công. Organizer sẽ bao gồm danh sách admin nếu là Group.',
	})
	@ApiResponse({ status: 400, description: 'RSVP thất bại' })
	async rsvpEvent(
		@Request() req,
		@Param('eventId') eventId: string,
		@Query('status') status: string,
		@I18n() i18n: I18nContext,
	) {
		if (!Object.values(RSVPStatus).includes(status as RSVPStatus)) {
			throw new HttpException(
				{
					success: false,
					message: i18n.t('event.RSVP_STATUS_INVALID'),
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		await this.eventService.rsvpEvent(eventId, req.user.id, status as RSVPStatus, i18n);
		return {
			success: true,
			message: i18n.t('event.RSVP_SUCCESS'),
		};
	}

	@Get(':eventId/participants')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy danh sách người tham gia sự kiện' })
	@ApiParam({ name: 'eventId', description: 'ID sự kiện', example: '507f1f77bcf86cd799439011' })
	@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
	@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách người tham gia thành công',
		type: PaginatedEventParticipantsResponseDto,
	})
	async getParticipants(
		@Param('eventId') eventId: string,
		@PaginationQuery(PaginationQueryDto) query: PaginationQueryDto,
		@I18n() i18n: I18nContext,
	): Promise<{ success: boolean; data: PaginatedEventParticipantsResponseDto; message: string }> {
		const { participants, total } = await this.eventService.getParticipants(eventId, {
			page: query.page ?? 1,
			limit: query.limit ?? 10,
		});
		return {
			success: true,
			data: {
				participants,
				total,
				page: query.page ?? 1,
				limit: query.limit ?? 10,
				totalPages: Math.ceil(total / (query.limit ?? 10)),
				hasNextPage: (query.page ?? 1) * (query.limit ?? 10) < total,
				hasPrevPage: (query.page ?? 1) > 1,
			},
			message: i18n.t('event.PARTICIPANTS_RETRIEVED_SUCCESS'),
		};
	}

	// ====== EXTRA EVENT APIS: INVITATION, NEARBY, USER EVENTS ======

	@Post(':eventId/invite')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Mời người dùng tham gia sự kiện' })
	@ApiParam({ name: 'eventId', description: 'ID sự kiện', example: '507f1f77bcf86cd799439011' })
	@ApiBody({ type: InviteUsersToEventDto })
	@ApiResponse({ status: 200, description: 'Gửi lời mời thành công' })
	@ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
	@ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
	@ApiResponse({ status: 403, description: 'Không có quyền mời người dùng' })
	@ApiResponse({ status: 404, description: 'Không tìm thấy sự kiện' })
	async inviteUsersToEvent(
		@Request() req,
		@Param('eventId') eventId: string,
		@Body() body: InviteUsersToEventDto,
		@I18n() i18n: I18nContext,
	) {
		await this.eventService.inviteUsersToEvent(eventId, req.user.id, body.userIds, i18n);
		return {
			success: true,
			message: i18n.t('event.INVITE_USERS_SUCCESS'),
		};
	}

	@Get('invitations/current-user')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy danh sách lời mời tham gia sự kiện của user hiện tại' })
	@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
	@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách lời mời thành công',
		type: PaginatedEventInvitationsResponseDto,
	})
	async getUserEventInvitations(
		@Request() req,
		@I18n() i18n: I18nContext,
		@PaginationQuery(PaginationQueryDto) query: PaginationQueryDto,
	): Promise<{ success: boolean; data: PaginatedEventInvitationsResponseDto; message: string }> {
		const { invitations, total } = await this.eventService.getUserEventInvitations(
			req.user.id,
			query.page ?? 1,
			query.limit ?? 10,
			i18n,
		);
		return {
			success: true,
			data: {
				invitations,
				total,
				page: query.page ?? 1,
				limit: query.limit ?? 10,
				totalPages: Math.ceil(total / (query.limit ?? 10)),
				hasNextPage: (query.page ?? 1) * (query.limit ?? 10) < total,
				hasPrevPage: (query.page ?? 1) > 1,
			},
			message: i18n.t('event.INVITATIONS_RETRIEVED_SUCCESS'),
		};
	}

	@Get(':eventId/invitations/sent')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy danh sách người dùng đã được user hiện tại mời tham gia sự kiện' })
	@ApiParam({ name: 'eventId', description: 'ID sự kiện', example: '507f1f77bcf86cd799439011' })
	@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
	@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
	@ApiResponse({ status: 200, description: 'Lấy danh sách lời mời đã gửi thành công' })
	async getSentInvitations(
		@Request() req,
		@Param('eventId') eventId: string,
		@PaginationQuery(PaginationQueryDto) query: PaginationQueryDto,
		@I18n() i18n: I18nContext,
	) {
		const { invitations, total } = await this.eventService.getSentInvitations(
			eventId,
			req.user.id,
			query.page ?? 1,
			query.limit ?? 10,
			i18n,
		);
		return {
			success: true,
			data: {
				invitations,
				total,
				page: query.page ?? 1,
				limit: query.limit ?? 10,
				totalPages: Math.ceil(total / (query.limit ?? 10)),
				hasNextPage: (query.page ?? 1) * (query.limit ?? 10) < total,
				hasPrevPage: (query.page ?? 1) > 1,
			},
			message: i18n.t('event.INVITATIONS_RETRIEVED_SUCCESS'),
		};
	}

	@Post('invitations/:invitationId/respond')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Phản hồi lời mời sự kiện (accept/reject)' })
	@ApiParam({ name: 'invitationId', description: 'ID lời mời', example: '...' })
	@ApiQuery({ name: 'status', required: true, enum: EventInvitationStatus })
	@ApiResponse({ status: 200, description: 'Phản hồi lời mời thành công' })
	@ApiResponse({ status: 404, description: 'Không tìm thấy lời mời' })
	async respondToInvitation(
		@Request() req,
		@Param('invitationId') invitationId: string,
		@Query('status') status: string,
		@I18n() i18n: I18nContext,
	) {
		if (!Object.values(EventInvitationStatus).includes(status as EventInvitationStatus)) {
			throw new HttpException(
				{
					success: false,
					message: i18n.t('event.INVITATION_STATUS_INVALID'),
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		const result = await this.eventService.respondToInvitation(
			invitationId,
			req.user.id,
			status as EventInvitationStatus,
			i18n,
		);
		return {
			success: true,
			data: result,
			message: i18n.t('event.INVITATION_RESPONDED_SUCCESS'),
		};
	}

	@Delete('invitations/:invitationId')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Hủy lời mời tham gia sự kiện (cho phép sender hoặc recipient xóa)' })
	@ApiParam({ name: 'invitationId', description: 'ID lời mời', example: '...' })
	@ApiResponse({ status: 200, description: 'Hủy lời mời thành công' })
	@ApiResponse({ status: 404, description: 'Không tìm thấy lời mời' })
	@ApiResponse({ status: 403, description: 'Không có quyền hủy lời mời' })
	async cancelInvitation(
		@Request() req,
		@Param('invitationId') invitationId: string,
		@I18n() i18n: I18nContext,
	) {
		await this.eventService.cancelInvitation(invitationId, req.user.id, i18n);
		return {
			success: true,
			message: i18n.t('event.INVITATION_CANCELLED_SUCCESS'),
		};
	}

	@Get('user/:userId')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({
		summary: 'Lấy danh sách sự kiện mà user đã tham gia theo userId',
		description:
			'Lấy danh sách sự kiện mà user đã tham gia. Nếu organizerType là GROUP, sẽ bao gồm danh sách admin của nhóm.',
	})
	@ApiParam({ name: 'userId', description: 'ID user', example: '507f1f77bcf86cd799439011' })
	@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
	@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
	@ApiQuery({ name: 'key', required: false, type: String, example: 'football' })
	@ApiResponse({
		status: 200,
		description:
			'Lấy danh sách sự kiện của user thành công. Organizer sẽ bao gồm danh sách admin nếu là Group.',
		type: PaginatedUserEventsResponseDto,
	})
	async getUserEvents(
		@Param('userId') userId: string,
		@I18n() i18n: I18nContext,
		@PaginationQuery(PaginationQueryDto) query: PaginationQueryDto,
		@Query('key') key?: string,
	): Promise<{ success: boolean; data: PaginatedUserEventsResponseDto; message: string }> {
		const { events, total } = await this.eventService.findEventsByUserId(
			userId,
			query.page ?? 1,
			query.limit ?? 10,
			key,
		);
		return {
			success: true,
			data: {
				events,
				total,
				page: query.page ?? 1,
				limit: query.limit ?? 10,
				totalPages: Math.ceil(total / (query.limit ?? 10)),
				hasNextPage: (query.page ?? 1) * (query.limit ?? 10) < total,
				hasPrevPage: (query.page ?? 1) > 1,
			},
			message: i18n.t('event.USER_EVENTS_RETRIEVED_SUCCESS'),
		};
	}

	@Get('list/recommendations')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({
		summary: 'Gợi ý sự kiện cho user hiện tại',
		description:
			'Lấy danh sách sự kiện được gợi ý cho user. Nếu organizerType là GROUP, sẽ bao gồm danh sách admin của nhóm.',
	})
	@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
	@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
	@ApiResponse({
		status: 200,
		description:
			'Lấy danh sách sự kiện gợi ý thành công. Organizer sẽ bao gồm danh sách admin nếu là Group.',
		schema: {
			example: {
				success: true,
				data: {
					events: [
						{
							_id: '507f1f77bcf86cd799439011',
							title: 'Football Match',
							organizer: {
								_id: '507f1f77bcf86cd799439012',
								name: 'Football Club',
								organizerType: 'Group',
								admins: [
									{
										_id: '507f1f77bcf86cd799439013',
										firstName: 'John',
										lastName: 'Doe',
										fullName: 'John Doe',
										avatar: 'https://example.com/avatar.jpg',
									},
								],
							},
						},
					],
					total: 1,
					page: 1,
					limit: 10,
				},
				message: 'Lấy danh sách sự kiện gợi ý thành công',
			},
		},
	})
	async getEventRecommendations(
		@Request() req,
		@PaginationQuery(PaginationQueryDto) query: PaginationQueryDto,
		@I18n() i18n: I18nContext,
	) {
		const recommendations = await this.eventService.getRecommendationsForUser(
			req.user.id,
			query.page ?? 1,
			query.limit ?? 10,
			i18n,
		);
		return {
			success: true,
			data: recommendations,
			message: i18n.t('event.RECOMMENDATIONS_RETRIEVED_SUCCESS'),
		};
	}

	@Get(':eventId/user-status')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy trạng thái RSVP và invitation của user hiện tại với event' })
	@ApiParam({ name: 'eventId', description: 'ID sự kiện', example: '507f1f77bcf86cd799439011' })
	@ApiResponse({
		status: 200,
		description: 'Lấy trạng thái thành công',
		schema: {
			example: {
				success: true,
				data: {
					rsvpStatus: 'going',
					invitationStatus: 'pending',
					invitationId: '6881b23c4993645c015035d4',
				},
				message: '...',
			},
		},
	})
	async getUserEventStatus(
		@Request() req,
		@Param('eventId') eventId: string,
		@I18n() i18n: I18nContext,
	) {
		const status = await this.eventService.getUserEventStatus(eventId, req.user.id);
		return {
			success: true,
			data: status,
			message: i18n.t('event.USER_EVENT_STATUS_RETRIEVED_SUCCESS'),
		};
	}
}
