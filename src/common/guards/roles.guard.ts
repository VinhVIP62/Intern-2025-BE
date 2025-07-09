import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@common/constants';
import { Role } from '@common/enum';
import { Request } from 'express';
import { Forbidden } from '@common/exceptions';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const rolesRequiredForRoute = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!rolesRequiredForRoute) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest<Request>();
		const hasRequiredRoles = rolesRequiredForRoute.some(role =>
			(user as { roles?: string[] })?.roles?.includes(role),
		);

		if (!hasRequiredRoles) {
			const rolesList = rolesRequiredForRoute.join(', ');
			throw new Forbidden('exception.auth.accessDenied', { roles: rolesList });
		}

		return hasRequiredRoles;
	}
}
