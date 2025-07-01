import { Controller, Post, Body, UseGuards, Version, Req, Get } from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import { Public } from '@common/decorators';
import { LoginDto, RegisterDto, ResponseAuthDto } from '../dto';
import { ResponseEntity } from '@common/types';
import { JwtRefreshAuthGuard } from '@common/guards';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from '@common/decorators/response.decorator';
import { ForgotPasswordDto } from '../dto/request/forgot-password.dto';
import { OtpService } from '../providers/otp.service';
import { OtpCodeDto } from '../dto/request/otpCode.dto';
import { OtpResponseDto } from '../dto/response/otpResponse.dto';
import { VerifyOtpResponseDto } from '../dto/response/verifyOtpResponse.dto';
import { ResetPasswordDto } from '../dto/request/resetPassWord.dto';
import { ResetPasswordService } from '../providers/resetPassword.service';
import { ResetPasswordResponse } from '../dto/response/resetPasswordResponse.dto';
import { LogoutResponse } from '../dto/response/logoutResponse.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly otpService: OtpService,
		private readonly resetPasswordService: ResetPasswordService,
	) {}

	@Post('login')
	@Public()
	@Version('1')
	@Response()
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

	@Get('logout')
	@Version('1')
	@Response()
	@ApiOperation({ summary: 'Logout user', description: 'Đăng xuất tài khoản người dùng' })
	@ApiResponse({
		status: 200,
		description: 'Log out thành công',
		type: LogoutResponse,
	})
	async logout(@Req() request: Request): Promise<ResponseEntity<LogoutResponse>> {
		const header = request.headers['authorization'] ? request.headers['authorization'] : '';
		const invalidToken = header.replace(/^Bearer\s/, '');
		const response = await this.authService.logout(invalidToken);
		return {
			success: true,
			data: response,
		};
	}

	@Post('register')
	@Public()
	@Version('1')
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
		const tokens = await this.authService.register(body.username, body.password, body.email);
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
			sub: req.user as { id: string; roles: string[] },
		});
		return { success: true, data: tokens };
	}

	@Post('get-otp')
	@Public()
	@Version('1')
	@ApiOperation({
		summary: 'Request OTP',
		description: 'Yêu cầu gửi OTP để xác thực',
	})
	@ApiResponse({
		status: 200,
		description: 'Yêu cầu OTP đã được gửi',
		type: OtpResponseDto,
	})
	@Response()
	async requestOtp(
		@Body() forgotPasswordDto: ForgotPasswordDto,
	): Promise<ResponseEntity<OtpResponseDto>> {
		const response = await this.otpService.requestOtp(forgotPasswordDto);
		return {
			success: true,
			data: response,
		};
	}

	@Post('verify-otp')
	@Public()
	@Version('1')
	@ApiOperation({
		summary: 'Verify OTP',
		description: 'Xác thực OTP đã gửi đến email',
	})
	@ApiResponse({
		status: 200,
		description: 'Xác thực OTP thành công',
		type: VerifyOtpResponseDto,
	})
	@Response()
	async verifyOtp(@Body() otpCodeDto: OtpCodeDto): Promise<ResponseEntity<VerifyOtpResponseDto>> {
		const response = await this.otpService.verifyOtpCode(otpCodeDto);
		await this.otpService.invalidateOtp(otpCodeDto.email);
		return {
			success: true,
			data: response,
		};
	}

	@Post('reset-password')
	@Public()
	@Version('1')
	@ApiOperation({
		summary: 'Reset Password',
		description: 'Thay đổi mật khẩu',
	})
	@ApiResponse({
		status: 200,
		description: 'Thay đổi mật khẩu thành công',
		type: ResetPasswordResponse,
	})
	@Response()
	async resetPassword(
		@Body() resetPasswordDto: ResetPasswordDto,
	): Promise<ResponseEntity<ResetPasswordResponse>> {
		const response = await this.resetPasswordService.resetPassword(resetPasswordDto);
		return {
			success: true,
			data: response,
		};
	}
}
