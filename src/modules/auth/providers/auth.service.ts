import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { UserService } from '@modules/user/providers/user.service';
import * as bcrypt from 'bcrypt';
import { Payload, Tokens } from '../types';

@Injectable()
export class AuthService {
	constructor(
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
					id: user._id,
					roles: user.roles,
				},
			},
			true,
		);

		return tokens;
	}

	async register(username: string, password: string): Promise<Tokens> {
		const user = await this.userService.create({ username, password });

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
