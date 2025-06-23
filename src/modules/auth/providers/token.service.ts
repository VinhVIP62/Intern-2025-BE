import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@modules/user/providers/user.service';
import { Payload, Tokens } from '../types';

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
			...(genRefresh && { refreshToken }),
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
}
