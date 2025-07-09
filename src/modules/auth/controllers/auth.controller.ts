import {
	Controller,
	Post,
	Body,
	UseGuards,
	Version,
	Req,
	Get,
	Res,
	Put,
	BadRequestException,
	UnauthorizedException,
	NotFoundException,
	ConflictException,
	Query,
	HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import { Public } from '@common/decorators';
import {
	LoginDto,
	RegisterDto,
	ResponseAuthDto,
	ResetPasswordDto,
	AuthGoogleLoginDto,
} from '../dto';
import { ResponseEntity } from '@common/types';
import { JwtAuthGuard, JwtRefreshAuthGuard } from '@common/guards';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponsePaging } from '@common/decorators/responsePaging.decorator';
import { Response } from '@common/decorators/response.decorator';
import { GoogleAuthGuard } from '@common/guards/google-auth.guard';
import { RequestOtpDto, VerifyOtpDto } from '../../../shared/verification/dto/otp.dto';
import { verificationService } from 'src/shared/verification/providers/verification.service';
import { TokenRequireDto } from '../dto/token.require.dto';
import { User } from '@modules/user/entities/user.schema';
import { UserService } from '@modules/user/providers/user.service';
import { ChangePasswordDto } from '@modules/user/dto/change-password.dto';
import { OTPType } from '@common/enum/otp.enum';

@Public()
@ApiTags('Auth')
@Controller('/')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly verificationService: verificationService,
		private readonly userService: UserService,
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
		const tokens = await this.authService.login(body);
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
	})
	@Response()
	async register(@Body() body: RegisterDto): Promise<ResponseEntity<ResponseAuthDto>> {
		try {
			const verify = await this.verificationService.otpVerify(body.account, body.otp, body.otpType);
			if (body.otpType !== OTPType.REGISTER) {
				return { success: false, message: 'OTP không hợp lệ', statusCode: HttpStatus.BAD_REQUEST };
			}
			if (!verify) {
				return { success: false, message: 'OTP không hợp lệ', statusCode: HttpStatus.BAD_REQUEST };
			}
			await this.verificationService.deleteOtp(body.account, body.otp, body.otpType);
			const tokens = await this.authService.register(body);
			return { success: true, data: tokens, statusCode: HttpStatus.CREATED };
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to register user',
				error: error.message,
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			};
		}
	}
	@Version('1')
	@ApiOperation({ summary: 'Request OTP', description: 'Yêu cầu OTP để đăng ký tài khoản' })
	@ApiResponse({
		status: 200,
		description: 'OTP sent successfully',
	})
	@Response()
	@Post('request-otp')
	async requestOtp(@Body() dto: RequestOtpDto): Promise<ResponseEntity<ResponseAuthDto>> {
		try {
			await this.verificationService.requestOtp(dto.account, dto.otpType);
			return { success: true, message: 'OTP sent successfully', statusCode: HttpStatus.OK };
		} catch (error) {
			return {
				success: false,
				message: error.message,
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			};
		}
	}

	@Version('1')
	@Post('refresh')
	@UseGuards(JwtRefreshAuthGuard)
	@ApiOperation({ summary: 'Refresh token', description: 'Cấp lại access token từ refresh token' })
	@ApiResponse({
		status: 200,
		description: 'Refresh token thành công',
		type: ResponseAuthDto,
	})
	@Response()
	@ApiBearerAuth()
	async refreshToken(@Req() req: Request): Promise<ResponseEntity<ResponseAuthDto>> {
		const tokens = await this.authService.refreshToken({
			sub: req.user as { id: string; roles: string[] },
		});
		return { success: true, data: tokens, statusCode: HttpStatus.OK };
	}

	// @Version('1')
	// @Public()
	// @Post('login/google-auth-url')
	// async googleAuthUrl(@Body() dto: AuthGoogleLoginDto) {
	// 	const googleData = await this.authService.getProfileByToken(dto);
	// 	console.log('googleData', googleData);
	// 	const tokens = await this.authService.validateGoogleUser(googleData);
	// 	return { success: true, data: tokens };
	// }

	// @Version('1')
	// @Public()
	// @UseGuards(GoogleAuthGuard)
	// @Get('login/google')
	// googleLogin() {}

	// @Version('1')
	// @Public()
	// @UseGuards(GoogleAuthGuard)
	// @Get('google/callback')
	// async googleCallback(@Req() req, @Res() res) {
	// 	// const token = await this.authService.validateGoogleUser(req.user);
	// 	// // return { success: true, data: token };
	// 	// // const response = await this.authService.googleCallback(req.user);
	// 	// res.redirect(`${process.env.FRONTEND_URL}/login?accessToken=${token}}`);
	// }

	// @Version('1')
	// @Post('logout')
	// @UseGuards(JwtAuthGuard)
	// @ApiBearerAuth()
	// @ApiOperation({ summary: 'Logout user', description: 'Đăng xuất tài khoản người dùng' })
	// @ApiResponse({
	// 	status: 200,
	// 	description: 'Đăng xuất thành công',
	// })
	// async logout(@Req() token: TokenRequireDto): Promise<ResponseEntity<ResponseAuthDto>> {
	// 	await this.authService.logout(token.accessToken, token.refreshToken);
	// 	return { success: true, message: 'Đăng xuất thành công', statusCode: HttpStatus.OK };
	// }

	@Version('1')
	@Response()
	@ApiOperation({ summary: 'Verify OTP', description: 'Xác thực OTP' })
	@ApiResponse({
		status: 200,
		description: 'OTP xác thực thành công',
		type: ResponseAuthDto,
	})
	@Post('verify-otp')
	async verifyOtp(@Body() dto: VerifyOtpDto): Promise<ResponseEntity<ResponseAuthDto>> {
		const verify = await this.verificationService.otpVerify(dto.account, dto.otp, dto.otpType);
		if (!verify) {
			return { success: false, message: 'OTP không hợp lệ', statusCode: HttpStatus.BAD_REQUEST };
		}
		if (dto.otpType === OTPType.LOGIN) {
			const tokens = await this.authService.loginByOtp(dto.account);
			await this.verificationService.deleteOtp(dto.account, dto.otp, dto.otpType);
			return { success: true, data: tokens, statusCode: HttpStatus.OK };
		}
		//type register, add mail, phone,
		if (
			dto.otpType === OTPType.REGISTER ||
			dto.otpType === OTPType.ADD_EMAIL ||
			dto.otpType === OTPType.ADD_PHONE ||
			dto.otpType === OTPType.FORGOT_PASSWORD
		) {
			return {
				success: false,
				message: 'OTP type không hợp lệ',
				statusCode: HttpStatus.BAD_REQUEST,
			};
		}

		// if (dto.otpType === 'forgot-password') {
		// 	//get token from service
		// 	const passwordChangeToken = await this.authService.tokenForgotPassword(dto.account, dto.otp);
		// 	return {
		// 		success: true,
		// 		message: 'OTP verified. Token valid for 10 minutes.',
		// 		data: {
		// 			passwordChangeToken,
		// 			expiresIn: '10m',
		// 		},
		// 	};
		// }

		return { success: true, message: 'OTP xác thực thành công', statusCode: HttpStatus.OK };
	}

	@Version('1')
	@Response()
	@Put('change-password-with-token')
	async changePasswordWithToken(
		@Req() req: Request,
		@Body() dto: ChangePasswordDto,
	): Promise<ResponseEntity<ResponseAuthDto>> {
		// Extract token from Authorization header (remove "Bearer " prefix)
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw new UnauthorizedException('Invalid authorization header');
		}
		const token = authHeader.substring(7); // Remove "Bearer " (7 characters)

		// Hash and update password
		await this.authService.changePasswordWithToken(token, dto.newPassword);

		return {
			success: true,
			message: 'Password changed successfully',
			statusCode: HttpStatus.OK,
		};
	}
	@Version('1')
	@Response()
	@Put('forgot-password')
	async changeForgotPasswordWithOtp(
		@Body() dto: ResetPasswordDto,
	): Promise<ResponseEntity<ResponseAuthDto>> {
		await this.authService.changeForgotPasswordWithOtp(dto.account, dto.otp, dto.newPassword);
		await this.verificationService.deleteOtp(
			dto.account,
			dto.otp,
			OTPType.FORGOT_PASSWORD as string,
		);
		return {
			success: true,
			message: 'Password changed successfully',
			statusCode: HttpStatus.OK,
		};
	}
}
