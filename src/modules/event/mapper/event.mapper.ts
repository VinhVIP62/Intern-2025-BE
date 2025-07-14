import { Injectable } from '@nestjs/common';
import { IProfileRepository } from '@modules/user/repositories/profile.repository';
import { Event } from '../entities/event.schema';

@Injectable()
export class EventMapper {
	constructor(private readonly profileRepo: IProfileRepository) {}
	async toResponse(event: Event, rsvp?: string) {
		const profile = await this.profileRepo.findById(event.ownerId);
		return {
			ownerFirstName: profile.firstName,
			ownerLastName: profile.lastName,
			ownerAvatar: profile.avatarUrl,
			id: event.id,
			title: event.title,
			content: event.content,
			mediaUrls: event.mediaUrls,
			reactsCount: event.reactsCount,
			commentsCount: event.commentsCount,
			createdAt: event.createdAt,
			updatedAt: event.updatedAt,
			rsvp: rsvp,
			isDeleted: event.isDeleted,
			address: event.address,
		};
	}
}
