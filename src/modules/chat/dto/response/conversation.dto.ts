import { MsgType } from '@common/enum/message/message.type';

class UserProfile {
	id: string;
	firstName: string;
	lastName: string;
	avatarUrl: string;

	constructor(partial: Partial<UserProfile>) {
		Object.assign(this, partial);
	}
}

export class ConversationDto {
	fromUserId: string;
	toUserId: string;
	lastMessage: string;
	lastMessageType: MsgType;
	lastMessageRefId: string;
	createdAt: Date;
	userProfile: UserProfile;

	constructor(partial: Partial<ConversationDto>) {
		Object.assign(this, partial);
	}
}
