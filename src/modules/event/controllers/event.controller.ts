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

@ApiTags('Events')
@Controller('events')
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@Version('1')
	@Get(':id')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Lấy thông tin chi tiết sự kiện' })
	@ApiResponse({ status: 200, description: 'Lấy thành công', type: ResponseEventDto })
	@Response('response.event.get.success')
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
	@ApiOperation({ summary: 'Gửi yêu cầu tham gia sự kiện' })
	@ApiResponse({ status: 200, description: 'Gửi yêu cầu hoặc tham gia thành công' })
	async joinEvent(@Param('id') eventId: string, @Req() req: Request) {
		await this.eventService.requestJoinEvent(eventId, req.user!.id);
	}

	@Version('1')
	@Get(':id/requests')
	@ApiBearerAuth()
	@ResponsePaging('response.event.requests.success')
	@ApiOperation({ summary: 'Lấy danh sách yêu cầu tham gia sự kiện theo status & phân trang' })
	@ApiResponse({ status: 200, description: 'Danh sách yêu cầu tham gia' })
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
	@Response('response.event.request.respond.success')
	@ApiOperation({ summary: 'Phản hồi yêu cầu tham gia sự kiện (accept / reject)' })
	@ApiResponse({ status: 200, description: 'Phản hồi thành công' })
	async respondJoinRequest(
		@Param('eventId') eventId: string,
		@Param('userId') userId: string,
		@Body() dto: UpdateRespondJoinRequestDto,
		@Req() req: Request,
	) {
		return this.eventService.respondJoinRequest(eventId, userId, req.user!.id, dto.status);
	}
}
