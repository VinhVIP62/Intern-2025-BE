import { ConflictException, Injectable } from '@nestjs/common';
import { TokenService } from './token.service';
import { UserService } from '@modules/user/providers/user.service';
import * as bcrypt from 'bcrypt';
import { Tokens } from '../types';
import { MailService } from '@modules/mail/mail.service';
import { OtpService } from './otp.service';
import { OAuth2Client } from 'google-auth-library';
import { User } from '@modules/user/entities/user.schema';
import { Conflict, EntityNotFound, InternalServerError, Unauthorized } from '@common/exceptions';
import { ResetPasswordDto } from '@modules/user/dto/reset-password.dto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly mailService: MailService,
		private readonly otpService: OtpService,
	) {}

	// ========== 1. OTP: Request & Verify ==========

	async requestOtpVerifyEmail(email: string) {
		const user = await this.userService.findByEmail(email);
		if (user) throw new Conflict('exception.auth.emailAlreadyExists');

		const code = this.otpService.generateOtp();
		await this.otpService.saveOtp(email, code, 'verify');
		await this.mailService.sendOTP(email, code, 'verify');
	}

	async requestOtpResetPassword(email: string) {
		const user = await this.userService.findByEmail(email);
		if (!user) throw new Conflict('exception.auth.emailNotFound');

		const code = this.otpService.generateOtp();
		await this.otpService.saveOtp(email, code, 'reset');
		await this.mailService.sendOTP(email, code, 'reset');
	}

	async verifyOtp(email: string, otp: string, type: 'verify' | 'reset') {
		const isValid = await this.otpService.verifyOtp(email, otp, type);
		if (!isValid) throw new Unauthorized('exception.auth.invalidOtp');

		// Nếu xác minh email → trả về tempToken để register
		if (type === 'verify') {
			const tempToken = await this.tokenService.generateTempToken({
				sub: email,
				verifiedEmail: true,
				type: 'temp',
			});
			return { tempToken };
		}

		// Nếu reset password → trả về tempToken để reset password
		if (type === 'reset') {
			const tempToken = await this.tokenService.generateTempToken({
				sub: email,
				verifiedEmail: true,
				type: 'temp',
			});
			return { tempToken };
		}
	}

	// ========== 2. Đăng ký & Reset mật khẩu ==========

	async register(email: string, password: string): Promise<Tokens> {
		const user = await this.userService.createUser({ email, password });

		const tokens = await this.tokenService.generateTokens(
			{
				sub: user._id.toString(),
				email: user.email,
				roles: user.roles,
			},
			true,
		);

		return tokens;
	}

	async resetPassword(email: string, dto: ResetPasswordDto): Promise<Tokens> {
		const user = await this.userService.findByEmail(email);
		if (!user) throw new EntityNotFound('exception.auth.emailNotFound');

		await this.userService.resetPassword(user._id, dto);

		const tokens = await this.tokenService.generateTokens(
			{
				sub: user._id.toString(),
				email: user.email,
				roles: user.roles,
			},
			true,
		);

		return tokens;
	}

	// ========== 3. Đăng nhập ==========

	async loginWithGoogle(idToken: string) {
		const ticket = await client.verifyIdToken({
			idToken,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();

		if (!payload?.email_verified) {
			throw new Unauthorized('exception.auth.emailNotVerified');
		}

		const email = payload.email;
		const fullName =
			[payload.family_name, payload.given_name].filter(Boolean).join(' ') || payload.name || '';

		if (!email) {
			throw new InternalServerError('exception.auth.googlePayloadInvalid');
		}

		let user: User | null;

		try {
			// Tạo user mới — nếu email đã tồn tại sẽ ném ConflictException
			user = await this.userService.createUser({
				email,
				fullName,
				avatarUrl: payload.picture || '',
				oauthProvider: 'google',
			});
		} catch (error) {
			// Nếu email đã tồn tại thì đăng nhập
			if (error instanceof ConflictException) {
				user = await this.userService.findByEmail(email);
			} else {
				throw error; // ném lỗi khác nếu không phải Conflict
			}
		}

		if (!user) {
			throw new InternalServerError('exception.auth.userCreationFailed');
		}

		// Tạo JWT token
		const tokens = await this.tokenService.generateTokens(
			{
				sub: user._id.toString(),
				email: user.email,
				roles: user.roles,
			},
			true,
		);

		return tokens;
	}

	async login(email: string, password: string): Promise<Tokens> {
		const user = await this.userService.findByEmail(email);
		if (!user) {
			throw new Unauthorized('exception.auth.invalidCredentials');
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			throw new Unauthorized('exception.auth.invalidCredentials');
		}

		const tokens = await this.tokenService.generateTokens(
			{
				sub: user._id.toString(),
				email: user.email,
				roles: user.roles,
			},
			true,
		);

		return tokens;
	}

	// ========== 4. Token & Logout ==========

	async logout(userId: string): Promise<void> {
		await this.tokenService.revokeRefreshToken(userId);
	}

	async refreshToken(token: string): Promise<Tokens> {
		const payload = await this.tokenService.validateRefreshToken(token);
		return this.tokenService.generateTokens(payload, true);
	}
}
