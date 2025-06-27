import { Controller, Post, Body, UseGuards, Version, Req } from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import { Public } from '@common/decorators';
import { LoginDto, RegisterDto, ResponseAuthDto } from '../dto';
import { ResponseEntity } from '@common/types';
import { JwtRefreshAuthGuard } from '@common/guards';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Public()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Version('1')
	@Post('login')
	@ApiOperation({ summary: 'Login user', description: 'Đăng nhập tài khoản người dùng' })
	@ApiResponse({
		status: 200,
		description: 'Login thành công',
		type: ResponseAuthDto,
	})
	async login(@Body() body: LoginDto): Promise<ResponseEntity<ResponseAuthDto>> {
		const tokens = await this.authService.login(body.username, body.password);
		return {
			success: true,
			data: tokens,
		};
	}

	@Version('1')
	@Post('register')
	@ApiOperation({ summary: 'Register user', description: 'Đăng ký tài khoản mới' })
	@ApiResponse({
		status: 201,
		description: 'Đăng ký thành công',
		type: ResponseAuthDto,
	})
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
	@ApiOperation({ summary: 'Refresh token', description: 'Cấp lại access token từ refresh token' })
	@ApiBearerAuth()
	@ApiResponse({
		status: 200,
		description: 'Refresh token thành công',
		type: ResponseAuthDto,
	})
	async refreshToken(@Req() req: Request) {
		const tokens = await this.authService.refreshToken({
			sub: req.user as { id: number; roles: string[] },
		});
		return { success: true, data: tokens };
	}
}
