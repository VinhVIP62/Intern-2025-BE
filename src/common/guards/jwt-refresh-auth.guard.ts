import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Redis } from 'ioredis';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('refresh-jwt') {
	constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
		super();
	}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const authHeader =
			typeof request.headers['authorization'] === 'string' ? request.headers['authorization'] : '';
		const token = authHeader.replace(/^Bearer\s/, '');

		const isBlacklisted = await this.redis.get(`blacklist:${token}`);
		if (isBlacklisted) {
			throw new UnauthorizedException('error.unauthorized');
		}
		return true;
	}
}
