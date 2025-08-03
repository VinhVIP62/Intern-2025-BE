import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	ConnectedSocket,
	SubscribeMessage,
	MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketUserService } from './socket.user.service';
import { NewMsgDto } from '@modules/chat/dto/request/new.msg.dto';
import { ChatService } from '@modules/chat/providers/chat.service';

@WebSocketGateway({ namespace: 'events', cors: true })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	private socketIdToUserId = new Map<string, string>();
	constructor(
		private readonly socketUserService: SocketUserService,
		private readonly chatService: ChatService,
	) {}

	async handleConnection(client: Socket) {
		const userId = client.handshake.query.userId as string;
		if (!userId) return client.disconnect();

		await this.socketUserService.addSocket(userId, client.id);

		this.socketIdToUserId.set(client.id, userId);
		console.log(`✅ User ${userId} connected on socket ${client.id}`);
	}

	async handleDisconnect(client: Socket) {
		const userId = this.socketIdToUserId.get(client.id);
		if (userId) {
			await this.socketUserService.removeSocket(userId, client.id);
			this.socketIdToUserId.delete(client.id);

			console.error(`❌ Disconnected socket ${client.id} of user ${userId}`);
		} else {
			console.warn(`⚠️ Socket ${client.id} disconnected without associated userId`);
		}
	}

	async sendNotificationToUser(userId: string, payload: any) {
		await this.socketUserService.getSockets(userId).then(socketIds => {
			for (const socketId of socketIds) {
				this.server.to(socketId).emit('notification', payload);
			}
		});
	}

	@SubscribeMessage('send_message')
	async handleSendMessage(@MessageBody() data: NewMsgDto, @ConnectedSocket() client: Socket) {
		const newMsg = await this.chatService.createMessage(data);
		if (!newMsg) {
			client.emit('error', { message: 'Failed to send message' });
			return;
		}
		client.emit('message_sent', newMsg);

		const senderSocketIds = await this.socketUserService.getSockets(data.fromUserId); // gửi cho tất cả các thiết bị của người gửi
		for (const socketId of senderSocketIds) {
			if (socketId !== client.id) {
				this.server.to(socketId).emit('own_message', newMsg);
			}
		}

		const receiverSocketIds = await this.socketUserService.getSockets(data.toUserId); // gửi cho tất cả các thiết bị của người nhận
		for (const socketId of receiverSocketIds) {
			this.server.to(socketId).emit('new_message', newMsg);
		}
	}

	@SubscribeMessage('ping')
	handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		client.emit('pong', { msg: 'Hello from server!' });
	}
}
