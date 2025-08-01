import {
	Body,
	Controller,
	Delete,
	Get,
	BadRequestException,
	HttpStatus,
	Param,
	ParseFilePipeBuilder,
	Post,
	Put,
	Query,
	Req,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { EventService } from '../providers/event.service';
import { UploadService } from '@modules/upload/providers/upload.service';
import { CreateEventDto } from '../dto/request/createEvent.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ResponseEntity } from '@common/types';
import { Response } from '@common/decorators/response.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Event } from '../entities/event.schema';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateEventDto } from '../dto/request/updateEvent.dto';
import { Request } from 'express';
import { PaginationQuery } from '@common/decorators/paginationQuery.decorator';
import { FileType } from '@common/types/file.type';

@Controller()
export class EventController {
	constructor(
		private readonly eventService: EventService,
		private readonly uploadService: UploadService,
	) {}
	@Post()
	@UseInterceptors(FilesInterceptor('files'))
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Response()
	@ApiOperation({ summary: 'Create event' })
	@ApiResponse({
		status: 201,
		description: 'Event created successfully',
		type: Event,
	})
	async createEvent(
		@Body() createEventDto: CreateEventDto,
		@Req() req: Request,
		@UploadedFiles(
			new ParseFilePipeBuilder()
				// .addFileTypeValidator({
				// 	fileType: FileType,
				// })
				.addMaxSizeValidator({
					maxSize: 1024 * 1024 * 50,
				})
				.build({
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
					fileIsRequired: false,
				}),
		)
		files?: Express.Multer.File[],
	) {
		const userId = (req.user as any).id;
		createEventDto.authorId = userId;
		const images = files ? await this.uploadService.uploadMultipleFiles(files, 'events') : [];
		createEventDto.images = images;
		// console.log(typeof createEventDto.images);
		// console.log('type check array', Array.isArray(createEventDto.images)); // should be true
		// console.log('createEventDto.images', createEventDto.images);
		// console.log('images create event', createEventDto);

		const event = await this.eventService.createEvent(createEventDto);
		return event;
	}

	@Get('my')
	@Response()
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get my events' })
	@ApiResponse({
		status: 200,
		description: 'Events fetched successfully',
		type: [Event],
	})
	async getMyEvents(
		@Req() req: Request,
		@PaginationQuery() paginationQuery: { page: number; limit: number },
	) {
		const userId = (req.user as any).id;

		return await this.eventService.getEventsByUserId(
			paginationQuery.page,
			paginationQuery.limit,
			userId,
		);
	}
	@Get('all')
	@Response()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all events' })
	@ApiResponse({
		status: 200,
		description: 'Events fetched successfully',
		type: [Event],
	})
	async getAllEvents(
		@PaginationQuery() paginationQuery: { page: number; limit: number },
		@Req() req: Request,
	) {
		const userId = (req.user as any).id;
		return await this.eventService.getAllEvents(
			paginationQuery.page,
			paginationQuery.limit,
			userId,
		);
	}

	@Get(':id')
	@ApiBearerAuth()
	@Response()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get event by id' })
	@ApiResponse({
		status: 200,
		description: 'Event fetched successfully',
		type: Event,
	})
	async getEventById(@Param('id') id: string, @Req() req: Request) {
		const userId = (req.user as any).id;
		return await this.eventService.getEventById(id, userId);
	}

	@Put(':id')
	@Response()
	@ApiBearerAuth()
	@ApiOperation({
		summary:
			'Update event, if no file, it will not update image, if image/video url not pass, it will not delete image/video',
	})
	@ApiResponse({
		status: 200,
		description: 'Event updated successfully',
		type: Event,
	})
	@UseInterceptors(FilesInterceptor('files'))
	@UseGuards(JwtAuthGuard)
	async updateEvent(
		@Param('id') id: string,
		@Body() updateEventDto: UpdateEventDto,
		@Req() req: Request,
		@UploadedFiles(
			new ParseFilePipeBuilder()
				// .addFileTypeValidator({
				// 	fileType: 'jpeg|png|jpg|webp|bmp|heic|mp4|mov|avi|mkv|webm|video/x-matroska',
				// })
				.addMaxSizeValidator({
					maxSize: 1024 * 1024 * 50,
				})
				.build({
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
					fileIsRequired: false,
				}),
		)
		files?: Express.Multer.File[],
	) {
		const userId = (req.user as any).id;
		const images = files ? await this.uploadService.uploadMultipleFiles(files, 'events') : [];
		updateEventDto.images = images;
		updateEventDto.userId = userId;
		return await this.eventService.updateEvent(id, updateEventDto);
	}
	@Delete(':id')
	@ApiBearerAuth()
	@Response()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Delete event' })
	@ApiResponse({
		status: 200,
		description: 'Event deleted successfully',
	})
	async deleteEvent(@Param('id') id: string, @Req() req: Request) {
		const userId = (req.user as any).id;
		return await this.eventService.deleteEvent(id, userId);
	}
	@Post(':id/join')
	@ApiBearerAuth()
	@Response()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Join event' })
	@ApiResponse({
		status: 200,
		description: 'Event joined successfully',
	})
	async joinEvent(@Param('id') id: string, @Req() req: Request) {
		const userId = (req.user as any).id;
		return await this.eventService.joinEvent(id, userId);
	}
	@Post(':id/leave')
	@ApiBearerAuth()
	@Response()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Leave event' })
	@ApiResponse({
		status: 200,
		description: 'Event left successfully',
	})
	async leaveEvent(@Param('id') id: string, @Req() req: Request) {
		const userId = (req.user as any).id;
		return await this.eventService.leaveEvent(id, userId, true);
	}
	@Delete(':id/cancel')
	@ApiBearerAuth()
	@Response()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Cancel join event' })
	@ApiResponse({
		status: 200,
		description: 'Join event canceled successfully',
	})
	async cancelJoinEvent(@Param('id') id: string, @Req() req: Request) {
		const userId = (req.user as any).id;
		return await this.eventService.leaveEvent(id, userId);
	}
	@Post(':id/accept')
	@ApiBearerAuth()
	@Response()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Accept join event' })
	@ApiResponse({
		status: 200,
		description: 'Join event accepted successfully',
	})
	async acceptJoinEvent(
		@Param('id') id: string,
		@Body() body: { userReqId: string },
		@Req() req: Request,
	) {
		if (body.userReqId === '') {
			throw new BadRequestException('User request id is required');
		}
		const userId = (req.user as any).id;
		return await this.eventService.acceptJoinEvent(id, userId, body.userReqId);
	}
	@Delete(':id/reject')
	@ApiBearerAuth()
	@Response()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Reject join event' })
	@ApiResponse({
		status: 200,
		description: 'Join event rejected successfully',
	})
	async rejectJoinEvent(
		@Param('id') id: string,
		@Body() body: { userReqId: string },
		@Req() req: Request,
	) {
		const userId = (req.user as any).id;
		return await this.eventService.rejectJoinEvent(id, userId, body.userReqId);
	}
	@Get(':id/joined')
	@ApiBearerAuth()
	@Response()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get user joined events' })
	@ApiResponse({
		status: 200,
		description: 'User joined events fetched successfully',
	})
	async getUserJoinedEvents(
		@Param('id') id: string,
		@PaginationQuery() paginationQuery: { page: number; limit: number },
	) {
		return await this.eventService.getUserJoinedEvents(
			id,
			paginationQuery.page,
			paginationQuery.limit,
		);
	}
	@Get(':id/request')
	@ApiBearerAuth()
	@Response()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get user request join events' })
	@ApiResponse({
		status: 200,
		description: 'User request join events fetched successfully',
	})
	async getUserRequestJoinEvents(
		@Param('id') id: string,
		@PaginationQuery() paginationQuery: { page: number; limit: number },
		@Req() req: Request,
	) {
		const userId = (req.user as any).id;
		return await this.eventService.getUserRequestJoinEvents(
			id,
			paginationQuery.page,
			paginationQuery.limit,
			userId,
		);
	}
}
