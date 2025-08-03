import { Injectable } from '@nestjs/common';
import { IProfileRepository } from '@modules/user/repositories/interfaces/profile.repository';
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
			interestedCount: event.interestedCount,
			startTime: event.startTime,
			endTime: event?.endTime,
			createdAt: event.createdAt,
			updatedAt: event.updatedAt,
			rsvp: rsvp,
			isDeleted: event.isDeleted,
			address: event.address,
			numOfMem: event.numOfMem,
			maxMem: event.maxMem,
			sportInterests: event.sportInterests,
			state: event.state,
			longitude: event.location.coordinates[0],
			latitude: event.location.coordinates[1],
		};
	}
}
