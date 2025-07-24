import { Injectable } from '@nestjs/common';
import { IEventRepository } from './event.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '@modules/event/entities/event.schema';
import { RSVPStatus, EventInvitationStatus } from '@modules/event/entities/event.enum';
import {
	EventInvitation,
	EventInvitationSchema,
} from '@modules/event/entities/event-invitation.schema';

@Injectable()
export class EventRepositoryImpl implements IEventRepository {
	constructor(
		@InjectModel(Event.name) private readonly eventModel: Model<Event>,
		@InjectModel(EventInvitation.name) private readonly invitationModel: Model<EventInvitation>,
	) {}

	async findManyByIds(ids: string[]): Promise<Event[]> {
		return this.eventModel.find({ _id: { $in: ids } }).lean();
	}

	async create(event: any): Promise<any> {
		return (await this.eventModel.create(event)).toObject();
	}

	async findAll(query: any, options: any): Promise<{ events: any[]; total: number }> {
		const { page = 1, limit = 10 } = options;
		const skip = (page - 1) * limit;
		const [events, total] = await Promise.all([
			this.eventModel
				.find(query)
				.skip(skip)
				.limit(limit)
				.populate({
					path: 'organizer',
					select: 'firstName lastName avatar fullName name description',
				})
				.lean(),
			this.eventModel.countDocuments(query),
		]);
		return { events, total };
	}

	async findById(id: string): Promise<any> {
		return this.eventModel
			.findById(id)
			.populate({
				path: 'organizer',
				select: 'firstName lastName avatar fullName name description',
			})
			.lean();
	}

	async updateById(id: string, update: any): Promise<any> {
		return this.eventModel.findByIdAndUpdate(id, update, { new: true }).lean();
	}

	async deleteById(id: string): Promise<any> {
		return this.eventModel.findByIdAndDelete(id).lean();
	}

	// Join event: add userId to participants if not already present
	async joinEvent(eventId: string, userId: string): Promise<any> {
		return this.eventModel
			.findByIdAndUpdate(
				eventId,
				{ $addToSet: { participants: userId }, $inc: { participantCount: 1 } },
				{ new: true },
			)
			.lean();
	}

	// Leave event: remove userId from participants
	async leaveEvent(eventId: string, userId: string): Promise<any> {
		return this.eventModel
			.findByIdAndUpdate(
				eventId,
				{ $pull: { participants: userId }, $inc: { participantCount: -1 } },
				{ new: true },
			)
			.lean();
	}

	// RSVP event: set RSVP status for user (store in a rsvps subdocument)
	async rsvpEvent(eventId: string, userId: string, status: RSVPStatus): Promise<any> {
		// Add or update RSVP status in a rsvps array [{ userId, status }]
		return this.eventModel
			.findByIdAndUpdate(
				eventId,
				{
					$pull: { rsvps: { userId } },
				},
				{ new: false },
			)
			.then(() =>
				this.eventModel
					.findByIdAndUpdate(eventId, { $addToSet: { rsvps: { userId, status } } }, { new: true })
					.lean(),
			);
	}

	// Get paginated participants with user info
	async getParticipants(
		eventId: string,
		options: { page: number; limit: number },
	): Promise<{ participants: any[]; total: number }> {
		const event = await this.eventModel
			.findById(eventId)
			.populate({
				path: 'participants',
				select: 'firstName lastName avatar fullName',
			})
			.lean();
		if (!event) return { participants: [], total: 0 };
		const total = event.participants.length;
		const start = (options.page - 1) * options.limit;
		const end = start + options.limit;
		const paginated = event.participants.slice(start, end);
		return { participants: paginated, total };
	}

	// ===== INVITATION, NEARBY, USER EVENTS =====

	async inviteUsersToEvent(eventId: string, senderId: string, userIds: string[]): Promise<void> {
		const invitations = userIds.map(userId => ({
			eventId,
			senderId,
			recipientId: userId,
			status: EventInvitationStatus.PENDING,
		}));
		await this.invitationModel.insertMany(invitations);
	}

	async getUserEventInvitations(
		userId: string,
		page: number,
		limit: number,
		status?: EventInvitationStatus,
	): Promise<{ invitations: any[]; total: number }> {
		const skip = (page - 1) * limit;
		const query: any = { recipientId: userId };
		if (status) query.status = status;
		const [invitations, total] = await Promise.all([
			this.invitationModel.find(query).skip(skip).limit(limit).populate('eventId').lean(),
			this.invitationModel.countDocuments(query),
		]);
		return { invitations, total };
	}

	async respondToInvitation(
		invitationId: string,
		userId: string,
		status: EventInvitationStatus,
	): Promise<any> {
		return this.invitationModel
			.findOneAndUpdate({ _id: invitationId, recipientId: userId }, { status }, { new: true })
			.lean();
	}

	async findEventsByUserId(
		userId: string,
		page: number,
		limit: number,
		key?: string,
	): Promise<{ events: any[]; total: number }> {
		const skip = (page - 1) * limit;
		const query: any = { participants: userId };
		if (key && key.trim() !== '') {
			query.title = { $regex: key, $options: 'i' };
		}
		const [events, total] = await Promise.all([
			this.eventModel.find(query).skip(skip).limit(limit).lean(),
			this.eventModel.countDocuments(query),
		]);
		return { events, total };
	}

	// Cancel invitation: chỉ cho phép sender hoặc recipient xóa
	async cancelInvitation(invitationId: string, userId: string): Promise<any> {
		return this.invitationModel
			.findOneAndDelete({
				_id: invitationId,
				$or: [{ senderId: userId }, { recipientId: userId }],
			})
			.lean();
	}

	// Get invitations sent by current user for a specific event
	async getSentInvitations(
		eventId: string,
		senderId: string,
		page: number,
		limit: number,
	): Promise<{ invitations: any[]; total: number }> {
		const skip = (page - 1) * limit;
		const query: any = { eventId, senderId };
		const [invitations, total] = await Promise.all([
			this.invitationModel
				.find(query)
				.skip(skip)
				.limit(limit)
				.populate({
					path: 'recipientId',
					select: 'firstName lastName avatar fullName',
				})
				.lean(),
			this.invitationModel.countDocuments(query),
		]);
		return { invitations, total };
	}

	// Tìm sự kiện gợi ý theo query, limit, skip (phân trang)
	async findRecommendedEvents(query: any, limit: number, skip: number): Promise<any[]> {
		return this.eventModel.find(query).sort({ startDate: 1 }).skip(skip).limit(limit).lean();
	}

	// Đếm tổng số sự kiện phù hợp query (phân trang)
	async countRecommendedEvents(query: any): Promise<number> {
		return this.eventModel.countDocuments(query);
	}

	async getUserEventStatus(
		eventId: string,
		userId: string,
	): Promise<{ rsvpStatus: RSVPStatus | null; invitationStatus: EventInvitationStatus | null }> {
		// Get RSVP status
		const event = await this.eventModel.findById(eventId).lean();
		let rsvpStatus: RSVPStatus | null = null;
		if (event && event.rsvps) {
			const rsvp = event.rsvps.find((r: any) => r.userId.toString() === userId.toString());
			if (rsvp) rsvpStatus = rsvp.status;
		}
		// Get invitation status
		const invitation = await this.invitationModel.findOne({ eventId, recipientId: userId }).lean();
		const invitationStatus: EventInvitationStatus | null = invitation ? invitation.status : null;
		return { rsvpStatus, invitationStatus };
	}
}
