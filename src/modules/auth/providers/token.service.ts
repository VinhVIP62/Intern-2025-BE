import { Inject, Injectable } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UserService } from '@modules/user/providers/user.service';
import { AccessPayload, Payload, RefreshPayload, TempPayload, Tokens } from '../types';
import { redisClient } from '@common/providers/redis.provider';
import { Unauthorized } from '@common/exceptions';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/env.config';
import { randomUUID } from 'crypto';
import { omit } from 'lodash';

@Injectable()
export class TokenService {
	constructor(
		@Inject('JWT_ACCESS_TOKEN') private readonly AccessTokenService: JwtService,
		@Inject('JWT_REFRESH_TOKEN') private readonly RefreshTokenService: JwtService,
		private readonly userService: UserService,
		private readonly configService: ConfigService<IEnvVars>,
	) {}

	async generateTempToken(payload: TempPayload): Promise<string> {
		return this.AccessTokenService.signAsync(payload, {
			expiresIn: '15m',
		});
	}

	async generateTokens(payload: Payload, genRefresh: boolean = false): Promise<Tokens> {
		const cleanPayload = omit(payload, ['exp']) as Payload;

		// Only generate refresh token if genRefresh is true
		const [accessToken, refreshToken] = await Promise.all([
			this.generateAccessToken({ ...cleanPayload, type: 'access' }),
			genRefresh ? this.generateRefreshToken({ ...cleanPayload, type: 'refresh' }) : undefined,
		]);

		if (genRefresh && refreshToken) {
			await this.saveRefreshToken(payload.sub, refreshToken);
		}

		return {
			accessToken,
			...(genRefresh && { refreshToken }),
		};
	}

	private async generateAccessToken(payload: AccessPayload) {
		const expiresIn = this.configService.get('jwt.accessTokenExpiration', { infer: true });
		return this.AccessTokenService.signAsync(payload, { expiresIn });
	}

	private async generateRefreshToken(payload: RefreshPayload) {
		const expiresIn = this.configService.get('jwt.refreshTokenExpiration', { infer: true });
		const cleanPayload = omit(payload, ['jti']) as RefreshPayload;
		return this.RefreshTokenService.signAsync(cleanPayload, { expiresIn, jwtid: randomUUID() });
	}

	async saveRefreshToken(userId: string, token: string) {
		await redisClient.set(`refresh:${userId}`, token, 'EX', 7 * 24 * 3600); // 7 ngày
	}

	async validateRefreshToken(token: string): Promise<AccessPayload> {
		try {
			const payload = await this.RefreshTokenService.verifyAsync<AccessPayload>(token);

			const storedToken = await redisClient.get(`refresh:${payload.sub}`);
			if (!storedToken || storedToken !== token) {
				throw new Unauthorized('validation.auth.refreshToken.revoked');
			}

			return payload;
		} catch (err) {
			if (err instanceof TokenExpiredError) {
				throw new Unauthorized('validation.auth.refreshToken.expired');
			}
			if (err instanceof Unauthorized) {
				throw err;
			}
			throw new Unauthorized('validation.auth.refreshToken.invalid');
		}
	}

	async revokeRefreshToken(userId: string) {
		await redisClient.del(`refresh:${userId}`);
	}
}
