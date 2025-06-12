import { Controller, Post, Body, UseGuards, Get, Req, Version } from '@nestjs/common';
import { AuthService } from '@application/services/auth.service';
import { JwtAuthGuard } from '@src/presentation/guards/jwt-auth.guard';
import { Public } from '@src/presentation/decorators/public.decorator';
import { Roles } from '@src/presentation/decorators/roles.decorator';
import { RolesGuard } from '@src/presentation/guards/roles.guard';
import { Role } from '@application/services/user.service';

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
  async adminOnlyRoute() {
    return { message: 'This route is only accessible to admins' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Version('1')
  @Get('moderator-and-admin')
  async moderatorAndAdminRoute() {
    return { message: 'This route is accessible to moderators and admins' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.MODERATOR, Role.ADMIN)
  @Version('1')
  @Get('all-users')
  async allUsersRoute() {
    return { message: 'This route is accessible to all authenticated users' };
  }
}
