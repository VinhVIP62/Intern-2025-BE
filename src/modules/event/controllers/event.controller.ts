import { Body, Controller, Post, Req, Get, Patch, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateEventDto } from '../dto/createEvent.dto';
import { Response } from '@common/decorators/response.decorator';
import { EventService } from '../providers/event.service';
import { Request } from 'express';
import { ResponseEntity } from '@common/types';
import { InviteMemberDto } from '../dto/invite.members.dto';
import { RSVPDto } from '../dto/rsvp.dto';

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

	@Get('/me')
	@Response()
	async getMyEvents(@Req() request: Request): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.getMyEvent(user.id);
		return {
			success: true,
			data: res,
		};
	}

	@Post('/invite')
	@Response()
	async inviteMembers(
		@Req() request: Request,
		@Body() inviteRequest: InviteMemberDto,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.inviteMembers(user.id, inviteRequest);
		return {
			success: true,
			data: res,
		};
	}

	@Get('/invitations')
	@Response()
	async invitation(@Req() request: Request, @Body() rsvp: RSVPDto): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.invtation(user.id, rsvp.state);
		return {
			success: true,
			data: res,
		};
	}

	@Patch('/invitations/:eventId')
	@Response()
	async respondInvitation(
		@Req() request: Request,
		@Param('eventId') eventId: string,
		@Body() rsvp: RSVPDto,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.updateState(user.id, eventId, rsvp.state);
		return {
			success: true,
			data: res,
		};
	}

	@Get('/nearby')
	@Response()
	async getNearbyEvents(@Req() request: Request): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const events = await this.eventService.getNearbyEvents(user.id);
		return {
			success: true,
			data: events,
		};
	}
}
