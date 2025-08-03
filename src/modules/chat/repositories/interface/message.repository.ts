import { Injectable } from '@nestjs/common';
import { Message } from '@modules/chat/entities/message.schema';

@Injectable()
export abstract class IMessageRepository {
	abstract create(newMsg: Partial<Message>): Promise<Message>;
	abstract history(myId: string, userId: string, limit: number, before?: Date): Promise<Message[]>;
	abstract conversations(myId: string, limit: number, before?: Date): Promise<any[]>;
}
