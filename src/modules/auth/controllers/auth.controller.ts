import { Controller, Post, Body, UseGuards, Version, Req } from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import { Public } from '@common/decorators';
import { LoginDto, RegisterDto, ResponseAuthDto } from '../dto';
import { ResponseEntity } from '@common/types';
import { JwtRefreshAuthGuard } from '@common/guards';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';

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
	async login(
		@Body() body: LoginDto,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<ResponseAuthDto>> {
		const tokens = await this.authService.login(body, i18n);
		return {
			success: true,
			data: tokens,
			message: i18n.t('auth.LOGIN_SUCCESS'),
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
		@Body() body: RegisterDto,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<ResponseAuthDto>> {
		const tokens = await this.authService.register(body, i18n);
		return {
			success: true,
			data: tokens,
			message: i18n.t('auth.REGISTER_SUCCESS'),
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
	async refreshToken(@Req() req: Request, @I18n() i18n: I18nContext) {
		const tokens = await this.authService.refreshToken({
			sub: req.user as { id: string; roles: string[] },
		});
		return {
			success: true,
			data: tokens,
			message: i18n.t('auth.REFRESH_TOKEN_SUCCESS'),
		};
	}
}
