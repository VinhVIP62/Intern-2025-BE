import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { RolesGuard } from '@common/guards';
import { Controller, Get, UseGuards, Version } from '@nestjs/common';

@Controller('user')
export class UserController {
	// New protected routes to test RBAC
	// These routes' return values do not follow the ResponseEntity interface
	@UseGuards(RolesGuard)
	@Roles(Role.ADMIN)
	@Version('1')
	@Get('admin-only')
	adminOnlyRoute() {
		return { message: 'This route is accessible to admin' };
	}

	@UseGuards(RolesGuard)
	@Roles(Role.MODERATOR, Role.ADMIN)
	@Version('1')
	@Get('moderator-and-admin')
	moderatorAndAdminRoute() {
		return { message: 'This route is accessible to moderators and admin' };
	}

	@Version('1')
	@Get('all-users')
	allUsersRoute() {
		return { message: 'This route is accessible to all authenticated users' };
	}
}
