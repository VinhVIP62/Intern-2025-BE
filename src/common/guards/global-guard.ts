import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-access.guard';
import { RolesGuard } from './roles.guard';
import { ThrottlerGuard } from './throttler.guard';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@common/decorators';

@Injectable()
export class GlobalGuard implements CanActivate {
	constructor(
		private readonly jwtAuthGuard: JwtAuthGuard,
		private readonly rolesGuard: RolesGuard,
		private readonly throttlerGuard: ThrottlerGuard,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		// 1. Kiểm tra rate limit trước
		if (!(await this.throttlerGuard.canActivate(context))) return false;

		// 2. Nếu public, bỏ qua auth/roles
		if (isPublic) return true;

		// 3. Nếu không phải public, kiểm tra auth và role
		if (!(await this.jwtAuthGuard.canActivate(context))) return false;

		// 4. Kiểm tra quyền role (nếu route có yêu cầu)
		return this.rolesGuard.canActivate(context);
	}
}
