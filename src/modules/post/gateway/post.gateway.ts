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
import { PostService } from '../providers/post.service';
import { JwtService } from '@nestjs/jwt';

//be careful with the namespace, it will cause the server to not work
@WebSocketGateway({
	cors: {
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true,
	},
	// namespace: '/comments',
})
export class CommentGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	@WebSocketServer()
	server: Server;

	private readonly logger = new Logger(CommentGateway.name);

	constructor(
		private readonly postService: PostService,
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
				message: 'Successfully connected to the comment gateway',
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
	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('joinPost')
	async handleJoinPost(@MessageBody() data: { postId: string }, @ConnectedSocket() client: Socket) {
		try {
			const userId = client.data?.user?.id;
			const { postId } = data;

			if (!postId || !userId) {
				client.emit('error', {
					message: 'postId and userId are required',
				});
				return;
			}
			//leave previous post if any
			const previousPostId = client.data.currentPostId;
			if (previousPostId) {
				await client.leave(`post_${previousPostId}`);
				const currentUserId = client.data?.user?.userId || client.data?.user?.sub;
				client.to(`post_${previousPostId}`).emit('userLeft', {
					userId: currentUserId,
					postId: previousPostId,
					message: `User ${currentUserId} left the post`,
					timestamp: new Date().toISOString(),
				});
			}
			//join new post room
			await client.join(`post_${postId}`);
			client.data.currentPostId = postId;
			client.data.userId = userId;
			//get current room size
			console.log('Disconnect debug:', {
				server: !!this.server,
				sockets: !!this.server?.sockets,
				adapter: !!this.server?.sockets?.adapter,
				rooms: !!this.server?.sockets?.adapter?.rooms,
			});
			const room = this.server?.sockets?.adapter?.rooms?.get(`post_${postId}`);
			const userCount = room ? room.size : 1;

			//send user joined event to all users in the post room
			client.to(`post_${postId}`).emit('userJoined', {
				userId,
				postId,
				message: `User ${userId} joined the post`,
				activeUsers: userCount,
				timestamp: new Date().toISOString(),
			});

			//confirm to the user
			client.emit('joinedPost', {
				postId,
				message: 'Successfully joined post',
				timestamp: new Date().toISOString(),
				activeUsers: userCount,
			});

			this.logger.log(`User ${userId} joined post ${postId}. Active users: ${userCount}`);
		} catch (error) {
			this.logger.error(`Error joining post: ${error.message}`);
			client.emit('error', {
				message: 'Failed to join post',
				error: error.message,
			});
		}
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('createComment')
	async handleCreateComment(
		@MessageBody() data: { content: string; postId: string; isOriginal: boolean },
		@ConnectedSocket() client: Socket,
	) {
		try {
			const userId = client.data?.user?.id;
			const { postId, content } = data;

			if (!postId || !content || !userId) {
				client.emit('error', {
					message: 'postId, content and userId are required',
				});
				return;
			}
			//create comment using with my postService
			//create comment

			const newComment = await this.postService.commentPost(
				{
					...data,
					isOriginal: true,
					userId,
				},
				null,
				userId,
			);
			this.logger.log(`Message from ${userId} to ${postId}: ${content}`);
			//send comment to all users in the post room
			this.server.to(`post_${postId}`).emit('receiveComment', {
				postId,
				userId,
				message: newComment,
				timestamp: new Date().toISOString(),
			});

			//conform to user
			client.emit('commentCreated', {
				postId,
				message: 'Comment created successfully',
			});
		} catch (error) {
			this.logger.error(`Error creating comment: ${error.message}`);
			client.emit('error', {
				message: 'Failed to create comment',
				error: error.message,
			});
		}
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('replyComment')
	async handleReplyComment(
		@MessageBody() data: { content: string; parentCommentId: string; postId: string },
		@ConnectedSocket() client: Socket,
	) {
		const userId = client.data?.user?.id;
		try {
			const newComment = await this.postService.commentPost(
				{
					...data,
					postId: data.postId,
					userId,
					isOriginal: false,
				},
				data.parentCommentId,
				userId,
			);
			this.server.to(`post_${data.postId}`).emit('receiveComment', {
				postId: data.postId,
				userId,
				message: newComment,
			});
		} catch (error) {
			this.logger.error(`Error replying to comment: ${error.message}`);
			client.emit('error', {
				message: 'Failed to reply to comment',
				error: error.message,
			});
		}
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('deleteComment')
	async handleDeleteComment(
		@MessageBody() data: { postId: string; commentId: string },
		@ConnectedSocket() client: Socket,
	) {
		const userId = client.data?.user?.id;
		const { postId, commentId } = data;

		try {
			await this.postService.deleteComment(userId, postId, commentId);
			//emit to all users in the room
			this.server.to(`post_${postId}`).emit('commentDeleted', {
				postId,
				userId,
				commentId,
				message: 'Comment deleted successfully',
				timestamp: new Date().toISOString(),
			});
			client.emit('commentDeleted', {
				success: true,
				commentId,
			});

			//confirm to user
		} catch (error) {
			this.logger.error(`Error deleting comment: ${error.message}`);
			client.emit('error', {
				message: 'Failed to delete comment',
				error: error.message,
			});
		}
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('leavePost')
	async handleLeavePost(
		@MessageBody() data: { postId: string },
		@ConnectedSocket() client: Socket,
	) {
		const { postId } = data;
		const userId = client.data?.user?.id;
		await client.leave(postId);

		client.to(postId).emit('userLeft', {
			postId,
			userId: userId,
			message: `User ${userId} left the post`,
			timestamp: new Date().toISOString(),
		});
	}
}
