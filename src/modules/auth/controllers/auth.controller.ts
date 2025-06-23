import { Controller, Post, Body, UseGuards, Version, Req, Get } from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import { Public } from '@common/decorators';
import { LoginDto, RegisterDto, ResponseAuthDto } from '../dto';
import { ResponseEntity } from '@common/types';
import { JwtRefreshAuthGuard } from '@common/guards';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponsePaging } from '@common/decorators/responsePaging.decorator';
import { Response } from '@common/decorators/response.decorator';
import { GoogleAuthGuard } from '@common/guards/google-auth.guard';
import { RequestOtpDto, VerifyOtpDto } from '../../verification/dto/otp.dto';
import { verificationService } from '@modules/verification/providers/verification.service';

@Public()
@ApiTags('Auth')
@Controller('/')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly verificationService: verificationService,
	) {}

	@Version('1')
	@Post('login')
	@Response()
	@ApiOperation({ summary: 'Login user', description: 'Đăng nhập tài khoản người dùng' })
	@ApiResponse({
		status: 200,
		description: 'Login thành công',
		type: ResponseAuthDto,
	})
	async login(@Body() body: LoginDto): Promise<ResponseEntity<ResponseAuthDto>> {
		const tokens = await this.authService.login(body.accInput, body.password);
		console.log('controller return token', tokens);
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
		const tokens = await this.authService.register(body);
		return {
			success: true,
			data: tokens,
		};
	}
	@Version('1')
	@Post('request-otp')
	async requestOtp(@Body() dto: RequestOtpDto) {
		await this.verificationService.requestOtp(dto.accInput);
		return { success: true, message: 'OTP sent successfully' };
	}

	@Version('1')
	@Post('verify-otp')
	async verifyOtp(@Body() dto: VerifyOtpDto) {
		const tokens = await this.verificationService.otpVerify(dto.accInput, dto.otp);
		return tokens;
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
			sub: req.user as { id: string; roles: string[] },
		});
		return { success: true, data: tokens };
	}
	@Version('1')
	@Public()
	@UseGuards(GoogleAuthGuard)
	@Get('login/google')
	googleLogin() {}

	@Version('1')
	@Public()
	@UseGuards(GoogleAuthGuard)
	@Get('google/callback')
	googleCallback() {}
}
