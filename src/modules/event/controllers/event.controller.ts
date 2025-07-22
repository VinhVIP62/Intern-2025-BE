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
import { EventService } from '../providers/event.service';
import {
	CreateEventDto,
	UpdateEventDto,
	EventResponseDto,
	PaginatedEventsResponseDto,
} from '../dto/event.dto';
import { SportType } from '@modules/user/enums/user.enum';

@ApiTags('Event')
@Controller('events')
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@Post()
	@ApiOperation({ summary: 'Tạo sự kiện mới' })
	@ApiBody({ type: CreateEventDto })
	@ApiResponse({ status: 201, description: 'Tạo sự kiện thành công', type: EventResponseDto })
	@ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
	async createEvent(@Body() createEventDto: CreateEventDto, @I18n() i18n: I18nContext) {
		try {
			const event = await this.eventService.createEvent({
				...createEventDto,
				startDate: new Date(createEventDto.startDate),
				endDate: new Date(createEventDto.endDate),
			});
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
	@ApiOperation({ summary: 'Lấy danh sách sự kiện' })
	@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
	@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
	@ApiQuery({ name: 'sport', required: false, enum: Object.values(SportType) })
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách sự kiện thành công',
		type: PaginatedEventsResponseDto,
	})
	async getAllEvents(
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('sport') sport?: string,
	) {
		const query: any = {};
		if (sport) query.sport = sport;
		const { events, total } = await this.eventService.getAllEvents(query, { page, limit });
		return {
			success: true,
			data: {
				events,
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
				hasNextPage: page * limit < total,
				hasPrevPage: page > 1,
			},
			message: i18n.t('event.EVENTS_RETRIEVED_SUCCESS'),
		};
	}

	@Get(':eventId')
	@ApiOperation({ summary: 'Lấy chi tiết sự kiện theo ID' })
	@ApiParam({ name: 'eventId', description: 'ID sự kiện', example: '507f1f77bcf86cd799439011' })
	@ApiResponse({ status: 200, description: 'Lấy sự kiện thành công', type: EventResponseDto })
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
	@ApiOperation({ summary: 'Cập nhật sự kiện' })
	@ApiParam({ name: 'eventId', description: 'ID sự kiện', example: '507f1f77bcf86cd799439011' })
	@ApiBody({ type: UpdateEventDto })
	@ApiResponse({ status: 200, description: 'Cập nhật sự kiện thành công', type: EventResponseDto })
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
	@ApiOperation({ summary: 'Xóa sự kiện' })
	@ApiParam({ name: 'eventId', description: 'ID sự kiện', example: '507f1f77bcf86cd799439011' })
	@ApiResponse({ status: 200, description: 'Xóa sự kiện thành công' })
	@ApiResponse({ status: 404, description: 'Không tìm thấy sự kiện' })
	async deleteEvent(@Param('eventId') eventId: string, @I18n() i18n: I18nContext) {
		const event = await this.eventService.deleteEvent(eventId);
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
			message: i18n.t('event.EVENT_DELETED_SUCCESS'),
		};
	}
}
