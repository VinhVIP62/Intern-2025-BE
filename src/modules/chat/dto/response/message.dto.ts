import { MsgType } from '@common/enum/message/message.type';

export class MessageDto {
	fromUserId: string;
	toUserId: string;
	type: MsgType;
	refId: string;
	message: string;
	createdAt: Date;

	constructor(partial: Partial<MessageDto>) {
		Object.assign(this, partial);
	}
}
