import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
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

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			return true;
		}

		return super.canActivate(context);
	}
}
