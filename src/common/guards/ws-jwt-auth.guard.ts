import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class WsJwtAuthGuard implements CanActivate {
	private logger = new Logger(WsJwtAuthGuard.name);
	constructor(@Inject('JWT_ACCESS_TOKEN') private readonly jwtService: JwtService) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		try {
			const client: Socket = context.switchToWs().getClient();
			const token = this.extractTokenFromSocket(client);
			if (!token) {
				this.logger.warn(`No token provided for socket ${client.id}`);
				return false;
			}

			const payload = this.jwtService.verify(token);
			client.data.user = payload.sub;
			this.logger.log(`WebSocket authenticated for user :${payload.sub.id}`);
			return true;
		} catch (error) {
			this.logger.error(`WebSocket authentication failed: ${error.message}`);
			return false;
		}
	}
	private extractTokenFromSocket(client: Socket): string | null {
		const authToken = client.handshake.auth.token;
		const headerToken = client.handshake.headers.authorization;
		const queryToken = client.handshake.query?.token;
		if (authToken) {
			return authToken;
		}
		if (headerToken && typeof headerToken === 'string') {
			return headerToken.replace('Bearer ', '');
		}
		if (queryToken && typeof queryToken === 'string') {
			return queryToken;
		}
		return null;
	}
}
