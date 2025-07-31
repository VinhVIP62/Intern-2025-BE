import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class SocketEventService {
	constructor(private readonly gateway: RealtimeGateway) {}

	sendNotification(userId: string, data: any) {
		this.gateway.emitToUser(userId, 'notification', data);
	}

	sendMessage(userId: string, data: any) {
		this.gateway.emitToUser(userId, 'message', data);
	}

	sendConversation(userId: string, data: any) {
		this.gateway.emitToUser(userId, 'conversation', data);
	}
}
