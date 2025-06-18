import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { RolesGuard } from '@common/guards';
import { Controller, Get, UseGuards, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
	// New protected routes to test RBAC
	// These routes' return values do not follow the ResponseEntity interface
	@UseGuards(RolesGuard)
	@Roles(Role.ADMIN)
	@Version('1')
	@Get('admin-only')
	@ApiOperation({ summary: 'Chỉ Admin được phép truy cập' })
	@ApiResponse({ status: 200, description: 'Truy cập thành công với quyền admin' })
	adminOnlyRoute() {
		return { message: 'This route is accessible to admin' };
	}

	@UseGuards(RolesGuard)
	@Roles(Role.MODERATOR, Role.ADMIN)
	@Version('1')
	@Get('moderator-and-admin')
	@ApiOperation({ summary: 'Moderator hoặc Admin được phép truy cập' })
	@ApiResponse({ status: 200, description: 'Truy cập thành công với quyền moderator hoặc admin' })
	moderatorAndAdminRoute() {
		return { message: 'This route is accessible to moderators and admin' };
	}

	@Version('1')
	@Get('all-users')
	@ApiOperation({ summary: 'Tất cả user có thể truy cập' })
	@ApiResponse({ status: 200, description: 'Truy cập thành công với bất kỳ user nào' })
	allUsersRoute() {
		return { message: 'This route is accessible to all authenticated users' };
	}
}
