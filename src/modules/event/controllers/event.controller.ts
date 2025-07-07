import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateEventDto } from '../dto/createEvent.dto';
import { Response } from '@common/decorators/response.decorator';
import { EventService } from '../providers/event.service';
import { Request } from 'express';
import { ResponseEntity } from '@common/types';

@ApiTags('Events')
@Controller({
	version: '1',
})
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@Post()
	@Response()
	@ApiTags('Create new event')
	async create(
		@Body() body: CreateEventDto,
		@Req() request: Request,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.create(user.id, body);
		return {
			success: true,
			data: res,
		};
	}
}
