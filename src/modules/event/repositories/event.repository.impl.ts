import { Injectable } from '@nestjs/common';
import { IEventRepository } from '../interfaces/event.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '@modules/event/entities/event.schema';
import {
	RSVPStatus,
	EventInvitationStatus,
	OrganizerType,
} from '@modules/event/entities/event.enum';
import {
	EventInvitation,
	EventInvitationSchema,
} from '@modules/event/entities/event-invitation.schema';
import { Group } from '@modules/group/entities/group.schema';

@Injectable()
export class EventRepositoryImpl implements IEventRepository {
	constructor(
		@InjectModel(Event.name) private readonly eventModel: Model<Event>,
		@InjectModel(EventInvitation.name) private readonly invitationModel: Model<EventInvitation>,
		@InjectModel(Group.name) private readonly groupModel: Model<Group>,
	) {}

	/**
	 * Enhance event with group admin data if organizerType is GROUP
	 */
	private async enhanceEventWithGroupAdmins(event: any): Promise<any> {
		if (event && event.organizerType === OrganizerType.GROUP && event.organizer) {
			const group = await this.groupModel
				.findById(event.organizer._id || event.organizer)
				.populate({
					path: 'admins',
					select: 'firstName lastName avatar fullName',
				})
				.lean({ virtuals: true });

			if (group) {
				// If organizer is already populated (has _id), just add admins
				if (event.organizer._id) {
					event.organizer.admins = group.admins;
				} else {
					// If organizer is just an ObjectId, replace with full group data
					event.organizer = {
						...group,
						admins: group.admins,
					};
				}
			}
		}
		return event;
	}

	/**
	 * Enhance multiple events with group admin data
	 */
	private async enhanceEventsWithGroupAdmins(events: any[]): Promise<any[]> {
		return Promise.all(events.map(event => this.enhanceEventWithGroupAdmins(event)));
	}

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
				.lean({ virtuals: true }),
			this.eventModel.countDocuments(query),
		]);

		// Enhance events with group admin data if organizerType is GROUP
		const enhancedEvents = await this.enhanceEventsWithGroupAdmins(events);

		return { events: enhancedEvents, total };
	}

	async findById(id: string): Promise<any> {
		const event = await this.eventModel
			.findById(id)
			.populate({
				path: 'organizer',
				select: 'firstName lastName avatar fullName name description',
			})
			.lean({ virtuals: true });

		// Enhance event with group admin data if organizerType is GROUP
		return this.enhanceEventWithGroupAdmins(event);
	}

	async updateById(id: string, update: any): Promise<any> {
		const event = await this.eventModel.findByIdAndUpdate(id, update, { new: true }).lean();

		// Enhance event with group admin data if organizerType is GROUP
		return this.enhanceEventWithGroupAdmins(event);
	}

	async deleteById(id: string): Promise<any> {
		return this.eventModel.findByIdAndDelete(id).lean();
	}

	// Join event: add userId to participants if not already present
	async joinEvent(eventId: string, userId: string): Promise<any> {
		const event = await this.eventModel
			.findByIdAndUpdate(
				eventId,
				{ $addToSet: { participants: userId }, $inc: { participantCount: 1 } },
				{ new: true },
			)
			.lean();

		// Enhance event with group admin data if organizerType is GROUP
		return this.enhanceEventWithGroupAdmins(event);
	}

	// Leave event: remove userId from participants
	async leaveEvent(eventId: string, userId: string): Promise<any> {
		const event = await this.eventModel
			.findByIdAndUpdate(
				eventId,
				{ $pull: { participants: userId }, $inc: { participantCount: -1 } },
				{ new: true },
			)
			.lean();

		// Delete any pending invitations for this user and event
		await this.invitationModel.deleteMany({
			eventId,
			$or: [{ senderId: userId }, { recipientId: userId }],
		});

		// Enhance event with group admin data if organizerType is GROUP
		return this.enhanceEventWithGroupAdmins(event);
	}

	// RSVP event: set RSVP status for user (store in a rsvps subdocument)
	async rsvpEvent(eventId: string, userId: string, status: RSVPStatus): Promise<any> {
		// Add or update RSVP status in a rsvps array [{ userId, status }]
		await this.eventModel.findByIdAndUpdate(
			eventId,
			{
				$pull: { rsvps: { userId } },
			},
			{ new: false },
		);

		const event = await this.eventModel
			.findByIdAndUpdate(eventId, { $addToSet: { rsvps: { userId, status } } }, { new: true })
			.lean();

		// Enhance event with group admin data if organizerType is GROUP
		return this.enhanceEventWithGroupAdmins(event);
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
			.lean({ virtuals: true });
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
			this.invitationModel
				.find(query)
				.skip(skip)
				.limit(limit)
				.populate({
					path: 'eventId',
					populate: {
						path: 'organizer',
						select: 'firstName lastName avatar fullName name description',
					},
				})
				.populate({
					path: 'senderId',
					select: 'firstName lastName avatar fullName',
				})
				.lean({ virtuals: true }),
			this.invitationModel.countDocuments(query),
		]);

		// Enhance events with group admin data if organizerType is GROUP
		const enhancedInvitations = await Promise.all(
			invitations.map(async invitation => {
				if (invitation.eventId) {
					invitation.eventId = await this.enhanceEventWithGroupAdmins(invitation.eventId);
				}
				return invitation;
			}),
		);

		return { invitations: enhancedInvitations, total };
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
			this.eventModel
				.find(query)
				.skip(skip)
				.limit(limit)
				.populate({
					path: 'organizer',
					select: 'firstName lastName avatar fullName name description',
				})
				.lean({ virtuals: true }),
			this.eventModel.countDocuments(query),
		]);

		// Enhance events with group admin data if organizerType is GROUP
		const enhancedEvents = await this.enhanceEventsWithGroupAdmins(events);

		return { events: enhancedEvents, total };
	}

	async findSimpleEventsByUserId(
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
			this.eventModel
				.find(query)
				.select('_id title description image sport status')
				.skip(skip)
				.limit(limit)
				.lean({ virtuals: true }),
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
				.lean({ virtuals: true }),
			this.invitationModel.countDocuments(query),
		]);
		return { invitations, total };
	}

	// Check if invitations already exist for given eventId, senderId, and recipientIds
	async checkExistingInvitations(
		eventId: string,
		senderId: string,
		recipientIds: string[],
	): Promise<{ eventId: string; senderId: string; recipientId: string }[]> {
		const existingInvitations = await this.invitationModel
			.find({
				eventId,
				senderId,
				recipientId: { $in: recipientIds },
			})
			.select('eventId senderId recipientId')
			.lean();

		return existingInvitations.map(invitation => ({
			eventId: invitation.eventId.toString(),
			senderId: invitation.senderId.toString(),
			recipientId: invitation.recipientId.toString(),
		}));
	}

	// Check if users are already participants in the event
	async checkExistingParticipants(eventId: string, userIds: string[]): Promise<string[]> {
		const event = await this.eventModel.findById(eventId).select('participants').lean();

		if (!event || !event.participants) {
			return [];
		}

		const participantIds = event.participants.map((id: any) => id.toString());
		return userIds.filter(userId => participantIds.includes(userId));
	}

	// Tìm sự kiện gợi ý theo query, limit, skip (phân trang)
	async findRecommendedEvents(query: any, limit: number, skip: number): Promise<any[]> {
		const events = await this.eventModel
			.find(query)
			.sort({ startDate: 1 })
			.skip(skip)
			.limit(limit)
			.lean();

		// Enhance events with group admin data if organizerType is GROUP
		return this.enhanceEventsWithGroupAdmins(events);
	}

	// Đếm tổng số sự kiện phù hợp query (phân trang)
	async countRecommendedEvents(query: any): Promise<number> {
		return this.eventModel.countDocuments(query);
	}

	async getUserEventStatus(
		eventId: string,
		userId: string,
	): Promise<{
		rsvpStatus: RSVPStatus | null;
		invitationStatus: EventInvitationStatus | null;
		invitationId: string | null;
	}> {
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
		const invitationId: string | null = invitation ? invitation._id?.toString() : null;
		return { rsvpStatus, invitationStatus, invitationId };
	}
}
