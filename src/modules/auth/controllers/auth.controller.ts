import { Controller, Post, Body, UseGuards, Version, Req } from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import { Public } from '@common/decorators';
import { LoginDto, RegisterDto, ResponseEntityDto, TokensDto } from '../dto';
import { JwtRefreshAuthGuard, JwtTempAuthGuard } from '@common/guards';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestOtpDto } from '../dto/request-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { Throttle } from '@nestjs/throttler';
import { Response } from '@common/decorators/response.decorator';
import { OtpVerifiedDto } from '../dto/verify-opt-responsse.dto';
import { Unauthorized } from '@common/exceptions';
import { ResetPasswordDto } from '@modules/user/dto/reset-password.dto';

@Public()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	// ========== 1. OTP: Request & Verify ==========

	@Version('1')
	@Post('request-verify-otp')
	@Throttle({ short: { limit: 5, ttl: 1000 } })
	@Response('response.auth.otp.sent')
	@ApiOperation({
		summary: 'Yêu cầu OTP',
		description: 'Gửi mã xác thực OTP đến email của người dùng để xác minh địa chỉ email.',
	})
	async requestVerifyOtp(@Body() dto: RequestOtpDto) {
		await this.authService.requestOtpVerifyEmail(dto.email);
		return { message: 'OTP sent' };
	}

	@Version('1')
	@Post('verify-email-otp')
	@Throttle({ short: { limit: 5, ttl: 1000 } })
	@Response('response.auth.otp.verified')
	@ApiOperation({
		summary: 'Xác thực mã OTP xác minh email',
		description:
			'Xác minh mã OTP được gửi đến email để xác nhận địa chỉ email trước khi đăng ký tài khoản.',
	})
	@ApiResponse({
		status: 200,
		description: 'Xác thực OTP thành công',
		type: OtpVerifiedDto,
	})
	async verifyEmailOtp(@Body() dto: VerifyOtpDto) {
		return await this.authService.verifyOtp(dto.email, dto.otp, 'verify');
	}

	@Version('1')
	@Post('request-reset-otp')
	@Throttle({ short: { limit: 5, ttl: 1000 } })
	@Response('response.auth.otp.sent')
	@ApiOperation({
		summary: 'Yêu cầu OTP khôi phục mật khẩu',
		description: 'Gửi mã xác thực OTP đến email của người dùng để khôi phục mật khẩu.',
	})
	async requestResetOtp(@Body() dto: RequestOtpDto) {
		await this.authService.requestOtpResetPassword(dto.email);
		return { message: 'OTP sent' };
	}

	@Version('1')
	@Post('verify-reset-otp')
	@Throttle({ short: { limit: 5, ttl: 1000 } })
	@Response('response.auth.otp.verified')
	@ApiOperation({
		summary: 'Xác thực mã OTP khôi phục mật khẩu',
		description:
			'Xác minh mã OTP được gửi đến email để khởi động quá trình đặt lại mật khẩu tài khoản.',
	})
	@ApiResponse({
		status: 200,
		description: 'Xác thực OTP thành công',
		type: OtpVerifiedDto,
	})
	async verifyResetOtp(@Body() dto: VerifyOtpDto) {
		return await this.authService.verifyOtp(dto.email, dto.otp, 'reset');
	}

	// ========== 2. Đăng ký & Login ==========

	@Version('1')
	@Post('register')
	@UseGuards(JwtTempAuthGuard)
	@ApiBearerAuth()
	@Response('response.auth.register.success')
	@ApiOperation({
		summary: 'Đăng ký tài khoản',
		description: 'Tạo tài khoản người dùng mới sau khi đã xác minh OTP thành công.',
	})
	@ApiResponse({
		status: 201,
		description: 'Đăng ký thành công',
		type: ResponseEntityDto<TokensDto>,
	})
	async register(
		@Req() req: Request,
		@Body() body: RegisterDto,
	): Promise<ResponseEntityDto<TokensDto>> {
		const payload = req.user as { email?: string; verifiedEmail?: boolean };

		if (!payload?.email || !payload?.verifiedEmail) {
			throw new Unauthorized('validation.auth.tempToken.invalid');
		}

		const tokens = await this.authService.register(payload.email, body.password);

		return {
			success: true,
			data: tokens,
		};
	}

	@Version('1')
	@Post('login')
	@Response('response.auth.login.success')
	@ApiOperation({
		summary: 'Đăng nhập',
		description: 'Đăng nhập bằng email và mật khẩu, trả về access token và refresh token.',
	})
	@ApiResponse({
		status: 200,
		description: 'Login thành công',
		type: ResponseEntityDto<TokensDto>,
	})
	async login(@Body() body: LoginDto): Promise<ResponseEntityDto<TokensDto>> {
		const tokens = await this.authService.login(body.email, body.password);
		return {
			success: true,
			data: tokens,
		};
	}

	@Version('1')
	@Post('google')
	@Throttle({ short: { limit: 5, ttl: 1000 } })
	@Response('response.auth.oauth.success')
	@ApiOperation({
		summary: 'Đăng nhập bằng Google',
		description: 'Xác thực người dùng bằng tài khoản Google và trả về access token, refresh token.',
	})
	async googleLogin(@Body('idToken') idToken: string) {
		return this.authService.loginWithGoogle(idToken);
	}

	// ========== 3. Reset Password ==========

	@Version('1')
	@Post('reset-password')
	@UseGuards(JwtTempAuthGuard)
	@ApiBearerAuth()
	@Response('response.auth.resetPassword.success')
	@ApiOperation({
		summary: 'Reset mật khẩu',
		description:
			'Đổi mật khẩu mới sau khi xác minh mã OTP thành công. Trả về access và refresh token mới.',
	})
	@ApiResponse({
		status: 200,
		description: 'Reset mật khẩu thành công',
		type: TokensDto,
	})
	async resetPassword(@Req() req: Request, @Body() dto: ResetPasswordDto) {
		const payload = req.user as { email?: string; verifiedEmail?: boolean };

		if (!payload?.email || !payload?.verifiedEmail) {
			throw new Unauthorized('validation.auth.tempToken.invalid');
		}

		const tokens = await this.authService.resetPassword(payload.email, dto);
		return { success: true, data: tokens };
	}

	// ========== 4. Refresh Token & Logout ==========

	@Version('1')
	@Post('refresh')
	@UseGuards(JwtRefreshAuthGuard)
	@Response('response.auth.refresh.success')
	@ApiOperation({
		summary: 'Làm mới token',
		description: 'Cấp lại access token từ refresh token hợp lệ.',
	})
	@ApiBearerAuth()
	@ApiResponse({
		status: 200,
		description: 'Refresh token thành công',
		type: ResponseEntityDto<TokensDto>,
	})
	async refreshToken(@Req() req: Request) {
		const user = req.user as {
			id: string;
			email: string;
			roles: string[];
			refreshToken: string;
		};
		const tokens = await this.authService.refreshToken(user.refreshToken);
		return { success: true, data: tokens };
	}

	@Version('1')
	@Post('logout')
	@UseGuards(JwtRefreshAuthGuard)
	@ApiBearerAuth()
	@Response('response.auth.logout.success')
	@ApiOperation({
		summary: 'Đăng xuất',
		description: 'Thu hồi refresh token hiện tại và đăng xuất người dùng.',
	})
	async logout(@Req() req: Request) {
		const user = req.user as { id: string };

		await this.authService.logout(user.id);

		return { success: true, message: 'Đăng xuất thành công' };
	}
}
