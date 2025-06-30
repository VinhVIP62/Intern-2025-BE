import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@common/decorators';
import type { Redis } from 'ioredis';

@Injectable()
export class JwtAuthGuard extends AuthGuard('access-jwt') {
	constructor(
		private reflector: Reflector,
		@Inject('REDIS_CLIENT') private readonly redis: Redis,
	) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			return true;
		}
		const result = (await super.canActivate(context)) as boolean;
		if (!result) return false;

		// Kiểm tra blacklist
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
