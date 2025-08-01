import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards, Logger, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtAuthGuard } from 'src/common/guards/ws-jwt-auth.guard';
import { FriendService } from '../providers/friend.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
	// namespace: 'friend',
	cors: {
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true,
	},
})
export class FriendGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	@WebSocketServer()
	server: Server;
	private readonly logger = new Logger(FriendGateway.name);

	constructor(
		private readonly friendService: FriendService,
		@Inject('JWT_ACCESS_TOKEN') private readonly jwtService: JwtService,
	) {}
	afterInit(server: Server) {
		this.logger.log('WebSocket server initialized');
	}

	async handleConnection(client: Socket) {
		try {
			const token =
				client.handshake.auth?.token ||
				client.handshake.headers?.authorization?.replace('Bearer ', '');

			if (!token) {
				this.logger.warn(`Connection rejected: No token provided`);
				client.emit('error', {
					message: 'No token provided',
				});
				client.disconnect();
				return;
			}
			// just log the connection
			// Validate JWT (you'd need to inject JWT service)
			const payload = await this.jwtService.verifyAsync(token);
			client.data.user = payload.sub;
			// this.logger.log(`payload: ${JSON.stringify(payload)}`);

			this.logger.log(`Client connected: ${client.id}`);
			client.emit('connected', {
				message: 'Successfully connected to the friend gateway',
				socketId: client.id,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			this.logger.error(`Error connecting to comment gateway: ${error.message}`);
			client.emit('error', {
				message: 'Failed to connect to comment gateway',
				error: error.message,
			});
			client.disconnect();
		}
	}

	handleDisconnect(client: Socket) {
		// Safely access user data with null checks
		const userId = client.data?.user?.id;
		const postId = client.data?.currentPostId;

		this.logger.log(`Client disconnected: ${client.id}, UserId: ${userId || 'unknown'}`);

		// Only emit userLeft if we have both userId and postId
		if (postId && userId) {
			const room = this.server?.sockets?.adapter?.rooms?.get(`post_${postId}`);
			const userCount = room ? room.size - 1 : 0;

			client.to(`post_${postId}`).emit('userLeft', {
				userId,
				postId,
				message: `User ${userId} disconnected`,
				activeUsers: userCount,
				timestamp: new Date().toISOString(),
			});
		}
	}
}
