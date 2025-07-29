import { Injectable } from '@nestjs/common';
import { IEventMemberRepository } from './eventmember.repository';
import { EventMember } from '../entities/eventmember.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RSVP } from '@common/enum/event/event.member.enum';

@Injectable()
export class EventMemberRepository implements IEventMemberRepository {
	constructor(
		@InjectModel(EventMember.name) private readonly eventmemberModel: Model<EventMember>,
	) {}

	async create(eventmember: Partial<EventMember>): Promise<EventMember> {
		return await this.eventmemberModel.create(eventmember);
	}

	async getByUserId(userid: string): Promise<EventMember[]> {
		return this.eventmemberModel.find({ memberId: userid });
	}

	async getByUserIdAndState(userId: string, state?: RSVP): Promise<EventMember[]> {
		if (state) return this.eventmemberModel.find({ memberId: userId, state: state });
		return this.eventmemberModel.find({ memberId: userId });
	}

	async updateInvitation(
		userId: string,
		eventId: string,
		state: RSVP,
	): Promise<EventMember | null> {
		return await this.eventmemberModel.findOneAndUpdate(
			{ memberId: userId, eventId: eventId },
			{ state: state },
			{ new: true },
		);
	}

	async getByEventId(eventId: string): Promise<EventMember[]> {
		return this.eventmemberModel.find({ eventId: eventId }).exec();
	}

	async getByEventIdAndState(eventId: string, state: RSVP): Promise<EventMember[]> {
		return this.eventmemberModel.find({ eventId: eventId, state: state }).exec();
	}

	async delete(userId: string, eventId: string): Promise<EventMember | null> {
		return this.eventmemberModel.findOneAndDelete({ memberId: userId, eventId: eventId });
	}

	async getByUserIdAndEventId(userId: string, eventId: string): Promise<EventMember | null> {
		return this.eventmemberModel.findOne({ memberId: userId, eventId: eventId });
	}
}
