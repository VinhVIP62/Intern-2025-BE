import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	// map socketId => userId (optional)
	private userSocketMap = new Map<string, string>();

	async handleConnection(client: Socket) {
		const userId = this.extractUserId(client);
		if (!userId) {
			client.disconnect();
			return;
		}

		this.userSocketMap.set(client.id, userId);
		await client.join(userId); // join room = userId
		console.log(`User ${userId} connected`);
	}

	handleDisconnect(client: Socket) {
		const userId = this.userSocketMap.get(client.id);
		if (userId) {
			console.log(`User ${userId} disconnected`);
			this.userSocketMap.delete(client.id);
		}
	}

	private extractUserId(client: Socket): string | null {
		const token = (client.handshake.auth?.token || client.handshake.query?.token) as
			| string
			| undefined;

		if (!token || typeof token !== 'string') return null;

		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
			return typeof payload.sub === 'string' ? payload.sub : null;
		} catch {
			return null;
		}
	}

	emitToUser(userId: string, event: string, data: any) {
		try {
			console.log('Current rooms:', Array.from(this.server.sockets.adapter.rooms.keys()));
			console.log('Checking emit to room (userId):', userId);
			const sockets = this.server.sockets.adapter.rooms.get(userId);
			if (!sockets || sockets.size === 0) {
				console.warn(`No active socket found for user ${userId}. Event "${event}" was not sent.`);
				return;
			}

			this.server.to(userId).emit(event, data);
		} catch (error) {
			console.error(`Failed to emit event "${event}" to user ${userId}:`, error);
		}
	}
}
