import { Controller, Post, Body, UseGuards, Version, Req } from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import { Public } from '@common/decorators';
import { LoginDto, RegisterDto, ResponseAuthDto } from '../dto';
import { ResponseEntity } from '@common/types';
import { JwtRefreshAuthGuard } from '@common/guards';
import { Request } from 'express';

@Public()
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Version('1')
	@Post('login')
	async login(@Body() body: LoginDto): Promise<ResponseEntity<ResponseAuthDto>> {
		const tokens = await this.authService.login(body.username, body.password);
		return {
			success: true,
			data: tokens,
		};
	}

	@Version('1')
	@Post('register')
	async register(
		@Body()
		body: RegisterDto,
	): Promise<ResponseEntity<ResponseAuthDto>> {
		const tokens = await this.authService.register(body.username, body.password);
		return {
			success: true,
			data: tokens,
		};
	}

	@Version('1')
	@Post('refresh')
	@UseGuards(JwtRefreshAuthGuard)
	async refreshToken(@Req() req: Request) {
		const tokens = await this.authService.refreshToken({
			sub: req.user as { id: string; roles: string[] },
		});
		return { success: true, data: tokens };
	}
}
