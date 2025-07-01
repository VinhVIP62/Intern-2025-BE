import { ConflictException, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { TokenService } from './token.service';
import { UserService } from '@modules/user/providers/user.service';
import * as bcrypt from 'bcrypt';
import { Payload, Tokens } from '../types';
import type { Redis } from 'ioredis';
import { LogoutResponse } from '../dto/response/logoutResponse.dto';

@Injectable()
export class AuthService {
	constructor(
		@Inject('REDIS_CLIENT') private readonly redis: Redis,
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
	) {}

	async login(username: string, password: string): Promise<Tokens> {
		const user = await this.userService.findOneByUsername(username);
		if (!user) {
			throw new UnauthorizedException('Username not found');
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid password');
		}

		const tokens = await this.tokenService.generateTokens(
			{
				username: user.username,
				sub: {
					id: user.id,
					roles: user.roles,
				},
			},
			true,
		);

		return tokens;
	}

	async logout(invalidToken: string): Promise<LogoutResponse> {
		await this.redis.set(`blacklist:${invalidToken}`, 1, 'EX', 60 * 15);
		const response = new LogoutResponse();
		response.message = 'logout.success';
		return response;
	}

	async register(username: string, password: string, email: string): Promise<Tokens> {
		const existingUser = await this.userService.findOneByUsernameOrEmail(username, email);
		if (existingUser) {
			throw new ConflictException('error.existingUsername');
		}

		const user = await this.userService.create({ username, password, email });

		const tokens = await this.tokenService.generateTokens(
			{
				username: user.username,
				sub: {
					id: user._id,
					roles: user.roles,
				},
			},
			true,
		);

		return tokens;
	}

	async refreshToken(payload: Payload): Promise<Tokens> {
		return await this.tokenService.generateTokens(payload);
	}
}
