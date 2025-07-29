import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IEventRepository } from '../repositories/event.repository';
import { CreateEventDto } from '../dto/createEvent.dto';
import { EventMapper } from '../mapper/event.mapper';
import { IEventMemberRepository } from '../repositories/eventmember.repository';
import { InviteMemberDto } from '../dto/invite.members.dto';
import { IUserRepository } from '@modules/user/repositories/interfaces/user.repository';
import { RSVP } from '@common/enum/event/event.member.enum';
import { SearchService } from '@modules/search/search.service';
import { EventState } from '@common/enum/event/event.state';
import { IProfileRepository } from '@modules/user/repositories/interfaces/profile.repository';
import { RSVPDto } from '../dto/rsvp.dto';
import { AcceptMemberDto } from '../dto/accept.members.dto';
import { RejectMemberDto } from '../dto/reject.members.dto';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { LocationDto } from '../dto/location.dto';
import { DeleteMemberDto } from '../dto/delete.members.dto';

@Injectable()
export class EventService {
	constructor(
		private readonly eventRepo: IEventRepository,
		private readonly eventMapper: EventMapper,
		private readonly eventMemberRepo: IEventMemberRepository,
		private readonly userRepo: IUserRepository,
		private readonly profileRepo: IProfileRepository,
		private readonly searchService: SearchService,
		private readonly notificationService: NotificationService,
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

	async overdueEvents(userId: string) {
		const within24hEvents = await this.eventRepo.overdueEvents(userId);
		console.log('overdue events: ');
		const res = await Promise.all(
			within24hEvents.map(async event => {
				const invitation = await this.eventMemberRepo.getByUserIdAndEventId(
					event.ownerId,
					event.id,
				);
				return this.eventMapper.toResponse(event, invitation?.state);
			}),
		);
		return res;
	}

	async within24h(userId: string) {
		const within24hEvents = await this.eventRepo._24hEvents(userId);
		console.log('within 24h events: ');
		const res = await Promise.all(
			within24hEvents.map(async event => {
				const invitation = await this.eventMemberRepo.getByUserIdAndEventId(
					event.ownerId,
					event.id,
				);
				return this.eventMapper.toResponse(event, invitation?.state);
			}),
		);
		return res;
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
				await this.notificationService.inviteToEventNoti(memberId, eventId, userId);
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
		const event = await this.eventRepo.getEventById(eventId);
		if (!event) throw new NotFoundException('event.NOT_FOUND');
		const curMem = event.numOfMem;
		if (curMem >= event.maxMem && state === RSVP.ACCEPTED) {
			throw new ConflictException('event.MAX_MEMBERS_REACHED');
		}
		const invitation = await this.eventMemberRepo.updateInvitation(userId, eventId, state);
		if (!invitation) throw new NotFoundException('event.NOT_FOUND');
		//update number of member
		if (state === RSVP.ACCEPTED) await this.eventRepo.updateMemberCount(eventId, 1);
		await this.notificationService.rsvpReplyNoti(event.ownerId, userId, eventId, state);

		const updated = await this.eventRepo.getEventById(eventId);
		if (!updated) throw new NotFoundException('event.NOT_FOUND');

		return this.eventMapper.toResponse(updated, state.toString());
	}

	async leave(userId: string, eventId: string) {
		const invitation = await this.eventMemberRepo.updateInvitation(userId, eventId, RSVP.REJECTED);
		if (!invitation) throw new NotFoundException('event.NOT_FOUND');

		await this.eventRepo.updateMemberCount(eventId, -1);
		const event = await this.eventRepo.getEventById(eventId);
		if (!event) throw new NotFoundException('event.NOT_FOUND');
		const ownerId = event.ownerId;
		await this.notificationService.rsvpReplyNoti(ownerId, userId, eventId, RSVP.REJECTED);
		const updated = await this.eventRepo.getEventById(eventId);
		if (!updated) throw new NotFoundException('event.NOT_FOUND');

		return this.eventMapper.toResponse(updated, RSVP.REJECTED);
	}

	async getNearbyEvents(userId: string, body: LocationDto, radiusInMeters = 5000) {
		const [lng, lat] = [body.longitude, body.latitude];

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
		const invitation = await this.eventMemberRepo.getByUserIdAndEventId(userId, eventId);
		if (invitation) {
			if (invitation.state === RSVP.ACCEPTED) {
				throw new ConflictException('event.ALREADY_ACCEPTED');
			}
			if (invitation.state === RSVP.INTERESTED) {
				throw new ConflictException('event.ALREADY_INTERESTED');
			}
			if (invitation.state === RSVP.REJECTED) {
				throw new ConflictException('event.ALREADY_REJECTED');
			}
			if (invitation.state === RSVP.INVITED) {
				throw new ConflictException('event.ALREADY_INVITED');
			}
			if (invitation.state === RSVP.PENDING) {
				throw new ConflictException('event.ALREADY_PENDING');
			}
		}
		await this.eventMemberRepo.create({
			eventId: eventId,
			memberId: userId,
			state: RSVP.INTERESTED,
		});

		await this.eventRepo.updateInterestedCount(eventId, 1);
		await this.notificationService.interestNoti(userId, eventId);
		return { message: 'event.IS_INTERESTED' };
	}

	async unInterest(userId: string, eventId: string) {
		const invitation = await this.eventMemberRepo.getByUserIdAndEventId(userId, eventId);
		if (invitation) {
			if (invitation.state === RSVP.ACCEPTED) {
				throw new ConflictException('event.ALREADY_ACCEPTED');
			}
			if (invitation.state === RSVP.REJECTED) {
				throw new ConflictException('event.ALREADY_REJECTED');
			}
			if (invitation.state === RSVP.INVITED) {
				throw new ConflictException('event.ALREADY_INVITED');
			}
			if (invitation.state === RSVP.PENDING) {
				throw new ConflictException('event.ALREADY_PENDING');
			}
		}
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
		await this.notificationService.requestJoinNoti(userId, eventId);
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
		const curMem = already.numOfMem;
		if (curMem + acceptMemberDto.memberIds.length >= already.maxMem) {
			throw new ConflictException('event.MAX_MEMBERS_REACHED');
		}
		await Promise.all(
			memberIds.map(async memberId => {
				const userfound = await this.userRepo.findOneById(memberId);
				if (!userfound) throw new NotFoundException('common.error');
				await this.eventMemberRepo.updateInvitation(userfound.id, eventId, RSVP.ACCEPTED);
				await this.notificationService.replyRequestToEventNoti(
					userId,
					memberId,
					eventId,
					RSVP.ACCEPTED,
				);
				await this.eventRepo.updateMemberCount(eventId, 1);
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
				await this.notificationService.replyRequestToEventNoti(
					userId,
					memberId,
					eventId,
					RSVP.REJECTED,
				);
			}),
		);
	}

	async deleteMembers(userId: string, deleteMemberDto: DeleteMemberDto) {
		const eventId = deleteMemberDto.eventId;
		const already = await this.eventRepo.getEventByUserIdAndEventId(userId, eventId);
		if (!already) throw new NotFoundException('event.NOT_FOUND');
		const memberIds = deleteMemberDto.memberIds;
		if (memberIds.length > already.numOfMem) {
			throw new ConflictException('common.error');
		}
		await Promise.all(
			memberIds.map(async memberId => {
				const userfound = await this.userRepo.findOneById(memberId);
				if (!userfound) throw new NotFoundException('common.error');
				await this.eventMemberRepo.delete(userfound.id, eventId);
				await this.eventRepo.updateMemberCount(eventId, -1);
			}),
		);
		const updatedEvent = await this.eventRepo.getEventById(eventId);
		if (!updatedEvent) throw new NotFoundException('event.NOT_FOUND');
		const res = await this.eventMapper.toResponse(updatedEvent, RSVP.OWNER);
		return res;
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

	async deleteEvent(userId: string, eventId: string) {
		const event = await this.eventRepo.getEventByUserIdAndEventId(userId, eventId);
		if (!event) throw new NotFoundException('event.NOT_FOUND');

		const invitations = await this.eventMemberRepo.getByEventId(eventId);

		await Promise.all(
			invitations.map(async invitation => {
				if (invitation.state === RSVP.OWNER) return;
				await this.notificationService.deleteEventNoti(invitation.memberId, eventId);
				return this.eventMemberRepo.delete(invitation.memberId, eventId);
			}),
		);

		const isDeleted = await this.eventRepo.delete(eventId);
		if (!isDeleted) throw new NotFoundException('event.NOT_FOUND');
		await this.searchService.delete('event', eventId);
		const res = await this.eventMapper.toResponse(isDeleted, RSVP.OWNER);
		return res;
	}

	async getRecommendations(userId: string) {
		const events = await this.eventRepo.getEventsNearby([0, 0], 5000);
		const res = await Promise.all(
			events.map(async event => {
				const invitation = await this.eventMemberRepo.getByUserIdAndEventId(userId, event.id);
				return this.eventMapper.toResponse(event, invitation?.state);
			}),
		);
		return res;
	}
}
