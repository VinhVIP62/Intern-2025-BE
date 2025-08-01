import { Injectable } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as Dto from '../dto';
import { JoinEvent, JoinEventDocument, Event, EventDocument } from '../entities';
import Fuse from 'fuse.js';
import { User } from '@modules/user/entities/user.schema';
import { userJoinedEventResponseDto } from '../dto/response/eventResponse.dto';

@Injectable()
export class EventRepositoryImpl implements EventRepository {
	constructor(
		@InjectModel(Event.name) private eventModel: Model<EventDocument>,
		@InjectModel(JoinEvent.name) private joinEventModel: Model<JoinEventDocument>,
	) {}

	async create(event: Dto.CreateEventDto): Promise<Event> {
		const maxJoin = event.maxJoin ? parseInt(event.maxJoin) : undefined;
		const newEvent = new this.eventModel({ ...event, maxJoin });
		await newEvent.save();
		//create join event
		await this.joinEventModel.create({
			eventId: newEvent._id,
			userId: event.authorId,
			status: 'joined',
		});
		return newEvent;
	}

	async findById(id: string): Promise<Event | null> {
		const event = await this.eventModel.findById(id);
		if (!event) {
			return null;
		}
		return event;
	}

	async findOne(query: any): Promise<Event | null> {
		const event = await this.eventModel.findOne(query);
		if (!event) {
			return null;
		}
		return event;
	}
	async findJoinEvent(query: any): Promise<JoinEvent | null> {
		const joinEvent = await this.joinEventModel.findOne(query);
		if (!joinEvent) {
			return null;
		}
		return joinEvent;
	}

	//find with pagination
	async findAll(page: number, limit: number): Promise<{ events: Event[]; total: number }> {
		const events = await this.eventModel
			.find()
			.skip((page - 1) * limit)
			.limit(limit)
			.exec();
		const total = await this.eventModel.countDocuments();
		return { events, total };
	}

	async update(id: string, event: Dto.UpdateEventDto): Promise<Event | null> {
		const updatedEvent = await this.eventModel.findByIdAndUpdate(id, event, { new: true });
		if (!updatedEvent) {
			return null;
		}
		return updatedEvent;
	}

	async delete(id: string): Promise<void> {
		const deletedEvent = await this.eventModel.findByIdAndDelete(id);
		if (!deletedEvent) {
			throw new Error('Failed to delete event');
		}
		//delete all join event
		await this.joinEventModel.deleteMany({ eventId: id });
	}

	async updateEventParticipants(eventId: string, userId: string, status: string): Promise<void> {
		await this.eventModel.findByIdAndUpdate(eventId, { $inc: { userJoin: 1 } });
	}
	async joinEvent(eventId: string, userId: string): Promise<JoinEvent> {
		const newJoinEvent = await this.joinEventModel.create({ eventId, userId, status: 'pending' });
		if (!newJoinEvent) {
			throw new Error('Failed to join event');
		}
		//update event participants
		return newJoinEvent;
	}

	async leaveEvent(eventId: string, userId: string): Promise<any> {
		//check case userId == authorId

		const deletedJoinEvent = await this.joinEventModel.deleteOne({ eventId, userId });
		if (!deletedJoinEvent) {
			throw new Error('Failed to leave event');
		}
		//update event participants
		await this.eventModel.findByIdAndUpdate(eventId, { $inc: { userJoin: -1 } });
		return deletedJoinEvent;
	}

	async cancelJoinEvent(eventId: string, userId: string): Promise<any> {
		const deletedJoinEvent = await this.joinEventModel.deleteOne({ eventId, userId });
		if (!deletedJoinEvent) {
			throw new Error('Failed to cancel join event');
		}
		return deletedJoinEvent;
	}

	async updateJoinEvent(eventId: string, userId: string, status: string): Promise<void> {
		// console.log('eventId', eventId);
		// console.log('userId', userId);
		// console.log('status', status);
		await this.joinEventModel.updateOne({ eventId, userId }, { status });
	}
	async deleteJoinEvent(eventId: string, userId: string): Promise<void> {
		await this.joinEventModel.deleteOne({ eventId, userId });
	}
	//find with pagination
	async getEventsByUserId(
		page: number,
		limit: number,
		userId: string,
	): Promise<{ events: Event[]; total: number }> {
		//find all event that user join
		const [userEvents, total] = await Promise.all([
			this.joinEventModel
				.find({ userId: userId, status: 'joined' })
				.skip((page - 1) * limit)
				.limit(limit)
				.exec(),
			this.joinEventModel.countDocuments({ userId: userId, status: 'joined' }).exec(),
		]);
		//find all event id in events
		const eventIds = userEvents.map(event => event.eventId);
		//find all event by eventIds
		const events = await this.eventModel.find({ _id: { $in: eventIds } });
		return { events, total };
	}

	async getEventById(id: string): Promise<Event | null> {
		const event = await this.eventModel.findById(id);
		if (!event) {
			return null;
		}
		return event;
	}
	//get all user joined events
	async getUserJoinedEvents(
		eventId: string,
		page: number,
		limit: number,
	): Promise<{ userJoinedEvents: userJoinedEventResponseDto[]; total: number }> {
		const [userEvents, total] = await Promise.all([
			this.joinEventModel
				.find({ eventId: eventId, status: 'joined' })
				.populate<{ userId: User }>('userId')
				.skip((page - 1) * limit)
				.limit(limit)
				.exec(),
			this.joinEventModel.countDocuments({ eventId: eventId, status: 'joined' }).exec(),
		]);
		//find all event id in events
		return {
			userJoinedEvents: userEvents.map(event => ({
				id: event.userId._id.toString(),
				fullName: event.userId.fullName || '',
				avatar: event.userId.avatar || '',
				createdAt: event.createdAt,
			})),
			total,
		};
	}
	async getUserRequestJoinEvents(
		eventId: string,
		page: number,
		limit: number,
	): Promise<{ userRequestJoinEvents: userJoinedEventResponseDto[]; total: number }> {
		const [userEvents, total] = await Promise.all([
			this.joinEventModel
				.find({ eventId: eventId, status: 'pending' })
				.populate<{ userId: User }>('userId')
				.skip((page - 1) * limit)
				.limit(limit)
				.exec(),
			this.joinEventModel.countDocuments({ eventId: eventId, status: 'pending' }).exec(),
		]);
		return {
			userRequestJoinEvents: userEvents.map(event => ({
				id: event.userId._id.toString(),
				fullName: event.userId.fullName || '',
				avatar: event.userId.avatar || '',
				createdAt: event.createdAt,
			})),
			total,
		};
	}

	async searchEvent(query: string): Promise<Event[]> {
		const events = await this.eventModel.find().lean();
		const fuse = new Fuse(events, {
			keys: ['title', 'description', 'location'],
			threshold: 0.3,
		});
		const results = fuse.search(query);
		return results.map(result => result.item);
	}
}
