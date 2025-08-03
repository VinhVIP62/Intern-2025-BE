import { RSVP } from '@common/enum/event/event.member.enum';
import { IsEnum, IsString } from 'class-validator';

export class FriendInEvent {
	@IsString()
	friendId: string;

	@IsString()
	friendAvatarUrl: string;

	@IsString()
	friendFirstname: string;

	@IsString()
	friendLastname: string;

	@IsEnum(RSVP)
	state: RSVP;
}
