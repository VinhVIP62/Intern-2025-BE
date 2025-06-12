import { Controller, Post, Body, UseGuards, Get, Version } from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { Role } from '@common/enum/roles.enum';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Version('1')
	@Post('login')
	async login(@Body() body: { email: string; password: string }) {
		return this.authService.login(body.email, body.password);
	}

	@Public()
	@Version('1')
	@Post('register')
	async register(
		@Body()
		userData: {
			email: string;
			password: string;
			firstName: string;
			lastName: string;
		},
	) {
		return this.authService.register(userData);
	}

	@Public()
	@Version('1')
	@Post('refresh')
	async refreshToken(@Body() body: { refreshToken: string }) {
		return this.authService.refreshToken(body.refreshToken);
	}

	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Post('logout')
	async logout(@Body() body: { refreshToken: string }) {
		return this.authService.logout(body.refreshToken);
	}

	// New protected routes to test RBAC
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.ADMIN)
	@Version('1')
	@Get('admin-only')
	adminOnlyRoute() {
		return { message: 'This route is only accessible to admins' };
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.MODERATOR, Role.ADMIN)
	@Version('1')
	@Get('moderator-and-admin')
	moderatorAndAdminRoute() {
		return { message: 'This route is accessible to moderators and admins' };
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.USER, Role.MODERATOR, Role.ADMIN)
	@Version('1')
	@Get('all-users')
	allUsersRoute() {
		return { message: 'This route is accessible to all authenticated users' };
	}
}
