import { MsgType } from '@common/enum/message/message.type';

export class NewMsgDto {
	fromUserId: string;
	toUserId: string;
	type: MsgType;
	refId: string;
	message: string;

	constructor(partial: Partial<NewMsgDto>) {
		Object.assign(this, partial);
	}
}
