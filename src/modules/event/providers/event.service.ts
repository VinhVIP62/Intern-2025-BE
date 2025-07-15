import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IEventRepository } from '../repositories/event.repository';
import { CreateEventDto } from '../dto/createEvent.dto';
import { EventMapper } from '../mapper/event.mapper';
import { IEventMemberRepository } from '../repositories/eventmember.repository';
import { InviteMemberDto } from '../dto/invite.members.dto';
import { IUserRepository } from '@modules/user/repositories/user.repository';
import { RSVP } from '@common/enum/event.member.enum';
import { SearchService } from '@modules/search/search.service';
import { EventState } from '@common/enum/event.state';
import { IProfileRepository } from '@modules/user/repositories/profile.repository';
import { RSVPDto } from '../dto/rsvp.dto';
import { AcceptMemberDto } from '../dto/accept.members.dto';
import { RejectMemberDto } from '../dto/reject.members.dto';

@Injectable()
export class EventService {
	constructor(
		private readonly eventRepo: IEventRepository,
		private readonly eventMapper: EventMapper,
		private readonly eventMemberRepo: IEventMemberRepository,
		private readonly userRepo: IUserRepository,
		private readonly profileRepo: IProfileRepository,
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
		if (!invitation) throw new NotFoundException('event.NOT_FOUND');

		//update number of member
		if (state === RSVP.ACCEPTED) await this.eventRepo.updateMemberCount(eventId, 1);

		const updated = await this.eventRepo.getEventById(eventId);
		if (!updated) throw new NotFoundException('event.NOT_FOUND');

		return this.eventMapper.toResponse(updated, state.toString());
	}

	async leave(userId: string, eventId: string) {
		const invitation = await this.eventMemberRepo.updateInvitation(userId, eventId, RSVP.REJECTED);
		if (!invitation) throw new NotFoundException('event.NOT_FOUND');

		await this.eventRepo.updateMemberCount(eventId, -1);
		const updated = await this.eventRepo.getEventById(eventId);
		if (!updated) throw new NotFoundException('event.NOT_FOUND');

		return this.eventMapper.toResponse(updated, RSVP.REJECTED);
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

	async interest(userId: string, eventId: string) {
		await this.eventMemberRepo.create({
			eventId: eventId,
			memberId: userId,
			state: RSVP.INTERESTED,
		});

		await this.eventRepo.updateInterestedCount(eventId, 1);
		return { message: 'event.IS_INTERESTED' };
	}

	async unInterest(userId: string, eventId: string) {
		const deleted = await this.eventMemberRepo.delete(userId, eventId);
		if (!deleted) {
			throw new NotFoundException('event.NOT_FOUND');
		}
		await this.eventRepo.updateInterestedCount(eventId, -1);
		return { message: 'event.UN_INTERESTED' };
	}

	async join(userId: string, eventId: string) {
		const invitationAlready = await this.eventMemberRepo.getByUserIdAndEventId(userId, eventId);
		if (invitationAlready) throw new ConflictException('already invite');
		const required = this.eventMemberRepo.create({
			memberId: userId,
			eventId: eventId,
			state: RSVP.PENDING,
		});
		return required;
	}

	async getPending(userId: string, eventId: string) {
		const event = await this.eventRepo.getEventByUserIdAndEventId(userId, eventId);
		if (!event) throw new NotFoundException('event.NOT_FOUND');
		const pendings = await this.eventMemberRepo.getByEventIdAndState(eventId, RSVP.PENDING);
		const res = await Promise.all(
			pendings.map(async pending => {
				const profile = await this.profileRepo.findById(pending.memberId);
				return {
					userId: profile.userId,
					firstName: profile.firstName,
					lastName: profile.lastName,
					avatarUrl: profile.avatarUrl,
					coverUrl: profile.coverUrl,
				};
			}),
		);
		return res;
	}

	async accept(userId: string, acceptMemberDto: AcceptMemberDto) {
		const eventId = acceptMemberDto.eventId;
		const already = await this.eventRepo.getEventByUserIdAndEventId(userId, eventId);
		if (!already) throw new NotFoundException('event.NOT_FOUND');
		const memberIds = acceptMemberDto.memberIds;
		await Promise.all(
			memberIds.map(async memberId => {
				const userfound = await this.userRepo.findOneById(memberId);
				if (!userfound) throw new NotFoundException('common.error');
				await this.eventMemberRepo.updateInvitation(userfound.id, eventId, RSVP.ACCEPTED);
			}),
		);
	}

	async reject(userId: string, rejectMemberDto: RejectMemberDto) {
		const eventId = rejectMemberDto.eventId;
		const already = await this.eventRepo.getEventByUserIdAndEventId(userId, eventId);
		if (!already) throw new NotFoundException('event.NOT_FOUND');
		const memberIds = rejectMemberDto.memberIds;
		await Promise.all(
			memberIds.map(async memberId => {
				const userfound = await this.userRepo.findOneById(memberId);
				if (!userfound) throw new NotFoundException('common.error');
				await this.eventMemberRepo.updateInvitation(userfound.id, eventId, RSVP.REJECTED);
			}),
		);
	}

	async getDetail(userId: string, eventId: string) {
		const event = await this.eventRepo.getEventById(eventId);
		if (!event) throw new NotFoundException('event.NOT_FOUND');
		const invitation = await this.eventMemberRepo.getByUserIdAndEventId(userId, eventId);
		return this.eventMapper.toResponse(event, invitation?.state);
	}

	async getAttendees(eventId: string, rsvp: RSVPDto) {
		const invitations = await this.eventMemberRepo.getByEventIdAndState(eventId, rsvp.state);
		const res = await Promise.all(
			invitations.map(async invitation => {
				const profile = await this.profileRepo.findById(invitation.memberId);
				return {
					userId: profile.userId,
					firstName: profile.firstName,
					lastName: profile.lastName,
					avatarUrl: profile.avatarUrl,
					coverUrl: profile.coverUrl,
				};
			}),
		);
		return res;
	}
}
