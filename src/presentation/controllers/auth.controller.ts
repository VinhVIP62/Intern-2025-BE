import { Controller, Post, Body, UseGuards, Get, Req, Version } from '@nestjs/common';
import { AuthService } from '@application/services/auth.service';
import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { Public } from '@infrastructure/auth/decorators/public.decorator';

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
}
