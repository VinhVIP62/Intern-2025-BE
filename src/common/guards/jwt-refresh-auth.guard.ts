import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('refresh-jwt') {
	async handleRequest<TUser = any>(
		err: any,
		user: any,
		info: any,
		context: ExecutionContext,
		status?: any,
	): Promise<TUser> {
		if (err || !user) {
			throw new UnauthorizedException('error.unauthorized');
		}
		const request = context.switchToHttp().getRequest<Request>();
		const authHeader = request.headers['authorization'] || '';
		const token = authHeader.replace(/^Bearer\s/, '');

		const isBlacklisted = await this.redis.get(`blacklist:${token}`);
		if (isBlacklisted) {
			throw new UnauthorizedException('error.unauthorized');
		}

		return user;
	}
}
