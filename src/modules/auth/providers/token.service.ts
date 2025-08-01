import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { IEnvVars } from '@configs/config';

import { TokenStoreService } from '@shared/modules/cache/providers';

import { Payload, Tokens } from '../types';

@Injectable()
export class TokenService {
	constructor(
		@Inject('JWT_ACCESS_TOKEN') private readonly AccessTokenService: JwtService,
		@Inject('JWT_REFRESH_TOKEN') private readonly RefreshTokenService: JwtService,
		private readonly configService: ConfigService<IEnvVars>,
		private readonly tokenStoreService: TokenStoreService,
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

	private async generateAccessToken(payload: Payload): Promise<string> {
		const token = await this.AccessTokenService.signAsync(payload);
		await this.tokenStoreService.addToken(
			payload.sub.id,
			token,
			this.configService.get('jwt.accessTokenExpiration', { infer: true })!,
		);
		return token;
	}

	private async generateRefreshToken(payload: Payload): Promise<string> {
		const token = await this.RefreshTokenService.signAsync(payload);
		return token;
	}

	async validateRefreshToken(token: string): Promise<Payload> {
		const payload = await this.RefreshTokenService.verifyAsync<Payload>(token);
		return payload;
	}

	async invalidateAccessTokensOf(userId: string): Promise<void> {
		await this.tokenStoreService.invalidateAccessTokensOf(userId);
	}
}
