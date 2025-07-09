import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@modules/user/providers/user.service';
import { Payload, Tokens, PasswordChangePayload } from '../types';

@Injectable()
export class TokenService {
	constructor(
		@Inject('JWT_ACCESS_TOKEN') private readonly AccessTokenService: JwtService,
		@Inject('JWT_REFRESH_TOKEN') private readonly RefreshTokenService: JwtService,
		private readonly userService: UserService,
	) {}

	async generateTokens(payload: Payload, genRefresh: boolean = false): Promise<Tokens> {
		// Only generate refresh token if genRefresh is true
		const [accessToken, refreshToken] = await Promise.all([
			this.generateAccessToken(payload),
			genRefresh ? this.generateRefreshToken(payload) : undefined,
		]);

		return {
			accessToken,
			refreshToken,
		};
	}

	private async generateAccessToken(payload: Payload) {
		return this.AccessTokenService.signAsync(payload);
	}

	private async generateRefreshToken(payload: Payload) {
		const token = await this.RefreshTokenService.signAsync(payload);
		return token;
	}

	async validateRefreshToken(token: string): Promise<Payload> {
		const payload = await this.RefreshTokenService.verifyAsync<Payload>(token);
		return payload;
	}
	// Add to your existing TokenService
	async generatePasswordChangeToken(userId: string, account: string): Promise<string> {
		const payload: PasswordChangePayload = {
			sub: {
				userId,
				account,
			},
			purpose: 'password-change',
			otpVerified: true,
		};

		// Use existing JWT service with shorter expiry
		return this.AccessTokenService.signAsync(payload, { expiresIn: '10m' });
	}

	async validatePasswordChangeToken(token: string): Promise<PasswordChangePayload> {
		const payload = await this.AccessTokenService.verifyAsync<PasswordChangePayload>(token);

		// Validate token purpose
		if (payload.purpose !== 'password-change') {
			throw new Error('Invalid token purpose');
		}

		if (!payload.otpVerified) {
			throw new Error('OTP not verified');
		}
		console.log(payload);

		return payload;
	}
}
