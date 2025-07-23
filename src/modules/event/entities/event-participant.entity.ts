import { IBaseEntity } from '@common/crud/entities';

export enum EventParticipantRole {
	GUEST = 'guest',
	MODERATOR = 'moderator',
	ORGANIZER = 'organizer',
}

export class EventParticipant extends IBaseEntity {
	userId!: string;
	role!: EventParticipantRole;
}
