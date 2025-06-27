import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@common/constants';
import { Role } from '@common/enum';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@common/decorators';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		const rolesRequiredForRoute = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!rolesRequiredForRoute || rolesRequiredForRoute.length == 0) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest<Request>();

		const hasRequiredRoles = rolesRequiredForRoute.some(role =>
			(user as { roles?: string[] })?.roles?.includes(role),
		);

		if (!hasRequiredRoles) {
			const rolesList = rolesRequiredForRoute.join(', ');
			throw new ForbiddenException(`Access denied. Allowed role(s): ${rolesList}`);
		}

		return hasRequiredRoles;
	}
}
