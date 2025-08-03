import { Body, Controller, Post, Req, Get, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateEventDto } from '../dto/createEvent.dto';
import { Response } from '@common/decorators/response.decorator';
import { EventService } from '../providers/event.service';
import { Request } from 'express';
import { ResponseEntity } from '@common/types';
import { InviteMemberDto } from '../dto/invite.members.dto';
import { RSVPDto } from '../dto/rsvp.dto';
import { AcceptMemberDto } from '../dto/accept.members.dto';
import { LocationDto } from '../dto/location.dto';
import { DeleteMemberDto } from '../dto/delete.members.dto';
import { FriendInEvent } from '../dto/friendsInEvent.dto';

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

	@Get('/detail/:eventId')
	@Response()
	async getDetailEvent(
		@Req() request: Request,
		@Param('eventId') eventId: string,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.getDetail(user.id, eventId);
		return {
			success: true,
			data: res,
		};
	}

	@Post('/attendees/:eventId')
	@Response()
	async getAttendees(
		@Param('eventId') eventId: string,
		@Body() rsvp: RSVPDto,
	): Promise<ResponseEntity<any>> {
		const res = await this.eventService.getAttendees(eventId, rsvp);
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

	@Post('/invitations')
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

	@Patch('leaves/:eventId')
	@Response()
	async leaveEvent(
		@Req() request: Request,
		@Param('eventId') eventId: string,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.leave(user.id, eventId);
		return {
			success: true,
			data: res,
		};
	}

	@Post('interest/:eventId')
	@Response()
	async interestEvent(
		@Req() request: Request,
		@Param('eventId') eventId: string,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.interest(user.id, eventId);
		return {
			success: true,
			data: res,
		};
	}

	@Delete('uninterest/:eventId')
	@Response()
	async unInterestEvent(
		@Req() request: Request,
		@Param('eventId') eventId: string,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.unInterest(user.id, eventId);
		return {
			success: true,
			data: res,
		};
	}

	@Put('/join/:eventId')
	@Response()
	async joinEvent(
		@Req() request: Request,
		@Param('eventId') eventId: string,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.join(user.id, eventId);
		return {
			success: true,
			data: res,
		};
	}

	@Put('/accept/:eventId')
	@Response()
	async accept(
		@Req() request: Request,
		@Body() dto: AcceptMemberDto,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.accept(user.id, dto);
		return {
			success: true,
			data: res,
		};
	}

	@Put('/reject/:eventId')
	@Response()
	async reject(
		@Req() request: Request,
		@Body() dto: AcceptMemberDto,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.reject(user.id, dto);
		return {
			success: true,
			data: res,
		};
	}

	@Put('/delete/:eventId')
	@Response()
	async deletemember(
		@Req() request: Request,
		@Body() deleteMemberDto: DeleteMemberDto,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.deleteMembers(user.id, deleteMemberDto);
		return {
			success: true,
			data: res,
		};
	}

	@Post('/nearby')
	@Response()
	async getNearbyEvents(
		@Req() request: Request,
		@Body() body: LocationDto,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const events = await this.eventService.getNearbyEvents(user.id, body, body.radiusInMeters);
		return {
			success: true,
			data: events,
		};
	}

	@Get('/recommendations')
	@Response()
	async getRecommendations(@Req() request: Request): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const recommendations = await this.eventService.getRecommendations(user.id);
		return {
			success: true,
			data: recommendations,
		};
	}

	@Get('/overdue')
	@Response()
	async getOverdueEvents(@Req() request: Request): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const overdueEvents = await this.eventService.overdueEvents(user.id);
		return {
			success: true,
			data: overdueEvents,
		};
	}

	@Delete('/delete/:eventId')
	@Response()
	async deleteEvent(
		@Req() request: Request,
		@Param('eventId') eventId: string,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.deleteEvent(user.id, eventId);
		return {
			success: true,
			data: res,
		};
	}

	@Get('/within24h')
	@Response()
	async within24hEvents(@Req() request: Request): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.eventService.within24h(user.id);
		return {
			success: true,
			data: res,
		};
	}

	@Get('/friendsInEvent/:eventId')
	@Response()
	async friendInEvent(
		@Query('eventId') eventId: string,
		@Req() request: Request,
	): Promise<ResponseEntity<FriendInEvent[]>> {
		const user = request.user as { id: string };
		const res = await this.eventService.friendsInEvent(user.id, eventId);
		return {
			success: true,
			data: res,
		};
	}
}
