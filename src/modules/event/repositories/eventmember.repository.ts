import { Injectable } from '@nestjs/common';
import { EventMember } from '../entities/eventmember.schema';
import { RSVP } from '@common/enum/event.member.enum';

@Injectable()
export abstract class IEventMemberRepository {
	abstract create(eventmember: Partial<EventMember>): Promise<EventMember>;
	abstract getByUserId(userid: string): Promise<EventMember[]>;
	abstract getByEventId(eventId: string): Promise<EventMember[]>;
	abstract getByEventIdAndState(eventId: string, state: RSVP): Promise<EventMember[]>;
	abstract getByUserIdAndState(userId: string, state?: RSVP): Promise<EventMember[]>;
	abstract getByUserIdAndEventId(userId: string, eventId: string): Promise<EventMember | null>;
	abstract updateInvitation(
		userId: string,
		eventId: string,
		state: RSVP,
	): Promise<EventMember | null>;
	abstract delete(userId: string, eventId: string): Promise<EventMember | null>;
}
