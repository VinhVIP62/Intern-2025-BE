import { Injectable, NotFoundException } from '@nestjs/common';
import { IEventRepository } from '../repositories/event.repository';
import { CreateEventDto } from '../dto/createEvent.dto';
import { EventMapper } from '../mapper/event.mapper';
import { IEventMemberRepository } from '../repositories/eventmember.repository';
import { InviteMemberDto } from '../dto/invite.members.dto';
import { IUserRepository } from '@modules/user/repositories/user.repository';
import { RSVP } from '@common/enum/event.member.enum';
import { SearchService } from '@modules/search/search.service';
import { EventState } from '@common/enum/event.state';

@Injectable()
export class EventService {
	constructor(
		private readonly eventRepo: IEventRepository,
		private readonly eventMapper: EventMapper,
		private readonly eventMemberRepo: IEventMemberRepository,
		private readonly userRepo: IUserRepository,
		private readonly searchService: SearchService,
	) {}

	async create(userId: string, body: CreateEventDto) {
		const event = await this.eventRepo.create({
			...body,
			ownerId: userId,
		});

		const invitation = await this.eventMemberRepo.create({
			memberId: userId,
			eventId: event.id,
		});

		const res = await this.eventMapper.toResponse(event, invitation.state);
		if (body?.state === EventState.PRIVATE) return res;
		await this.searchService.index('event', event.id, {
			id: event.id,
			ownerFirstName: res.ownerFirstName,
			ownerLastName: res.ownerLastName,
			title: event.title,
			content: event.content,
			sportInterests: event.sportInterests,
		});

		return res;
	}

	async getMyEvent(userId: string) {
		const allInvitations = await this.eventMemberRepo.getByUserId(userId);

		const events = await Promise.all(
			allInvitations.map(async invitaion => {
				const event = await this.eventRepo.getEventById(invitaion.eventId);
				if (!event) return null;
				return await this.eventMapper.toResponse(event, invitaion.state);
			}),
		);

		return events.filter(event => event != null);
	}

	async inviteMembers(userId: string, inviteMemberDto: InviteMemberDto) {
		const eventId = inviteMemberDto.eventId;
		const already = await this.eventRepo.getEventByUserIdAndEventId(userId, eventId);
		if (!already) throw new NotFoundException('event.NOT_FOUND');
		const memberIds = inviteMemberDto.memberIds;
		await Promise.all(
			memberIds.map(async memberId => {
				const userfound = await this.userRepo.findOneById(memberId);
				if (!userfound) throw new NotFoundException('common.error');
				await this.eventMemberRepo.create({
					eventId: eventId,
					memberId: memberId,
					state: RSVP.INVITED,
				});
			}),
		);
	}

	async invtation(userId: string, state?: RSVP) {
		const invitations = await this.eventMemberRepo.getByUserIdAndState(userId, state);

		const res = await Promise.all(
			invitations.map(async invitation => {
				const event = await this.eventRepo.getEventById(invitation.eventId);
				if (!event) return null;
				return this.eventMapper.toResponse(event, invitation.state);
			}),
		);

		return res.filter(event => event != null);
	}

	async updateState(userId: string, eventId: string, state: RSVP) {
		const invitation = await this.eventMemberRepo.updateInvitation(userId, eventId, state);
		if (!invitation) return { message: 'event.NOT_FOUND' };
		const updated = await this.eventRepo.getEventByUserIdAndEventId(userId, eventId);
		return updated;
	}

	async getNearbyEvents(userId: string, radiusInMeters = 5000) {
		const [lng, lat] = [106.7008, 10.7769]; // mock data

		const events = await this.eventRepo.getEventsNearby([lng, lat], radiusInMeters);
		const res = await Promise.all(
			events.map(async event => {
				const eventId = event.id;
				const invitation = await this.eventMemberRepo.getByUserIdAndEventId(userId, eventId);
				return this.eventMapper.toResponse(event, invitation?.state);
			}),
		);
		return res;
	}
}
