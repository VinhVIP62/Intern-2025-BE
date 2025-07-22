import { RSVPStatus, EventInvitationStatus } from '../entities/event.enum';

export interface IEventRepository {
	findManyByIds(ids: string[]): Promise<any[]>;
	create(event: any): Promise<any>;
	findAll(query: any, options: any): Promise<{ events: any[]; total: number }>;
	findById(id: string): Promise<any>;
	updateById(id: string, update: any): Promise<any>;
	deleteById(id: string): Promise<any>;

	// Participation APIs
	joinEvent(eventId: string, userId: string): Promise<any>;
	leaveEvent(eventId: string, userId: string): Promise<any>;
	rsvpEvent(eventId: string, userId: string, status: RSVPStatus): Promise<any>;
	getParticipants(
		eventId: string,
		options: { page: number; limit: number },
	): Promise<{ participants: any[]; total: number }>;

	// Event Invitation APIs
	inviteUsersToEvent(eventId: string, senderId: string, userIds: string[]): Promise<void>;
	getUserEventInvitations(
		userId: string,
		page: number,
		limit: number,
		status?: EventInvitationStatus,
	): Promise<{ invitations: any[]; total: number }>;
	respondToInvitation(
		invitationId: string,
		userId: string,
		status: EventInvitationStatus,
	): Promise<any>;

	// Cancel invitation
	cancelInvitation(invitationId: string, userId: string): Promise<any>;

	// User Events
	findEventsByUserId(
		userId: string,
		page: number,
		limit: number,
	): Promise<{ events: any[]; total: number }>;

	// Get invitations sent by current user for a specific event
	getSentInvitations(
		eventId: string,
		senderId: string,
		page: number,
		limit: number,
	): Promise<{ invitations: any[]; total: number }>;

	// Tìm sự kiện gợi ý theo query, limit, skip (phân trang)
	findRecommendedEvents(query: any, limit: number, skip: number): Promise<any[]>;

	// Đếm tổng số sự kiện phù hợp query (phân trang)
	countRecommendedEvents(query: any): Promise<number>;
}

export const IEventRepository = Symbol('IEventRepository');
