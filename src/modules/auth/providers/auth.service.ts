import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { Payload, Tokens } from '../types';
import { UserService } from '@modules/user/providers/user.service';
import { isPhoneNumber } from 'class-validator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
	constructor(
		private readonly tokenService: TokenService,
		private readonly userService: UserService,
	) {}

	async login(id: string, password: string): Promise<Tokens> {
		const isLoggedInViaPhone = isPhoneNumber(id);
		const user = await (isLoggedInViaPhone ?
			this.userService.findOneBy({ phone: id })
		:	this.userService.findOneBy({ mail: id }));
		if (!user) {
			throw new UnauthorizedException(`${isLoggedInViaPhone ? 'Phone number' : 'Email'} not found`);
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
					hasFinishedSetup: user.hasFinishedSetup,
				},
			},
			true,
		);

		return tokens;
	}

	async register(username: string, password: string, mail: string, phone: string): Promise<Tokens> {
		const user = await this.userService.create({ username, password, mail, phone });

		const tokens = await this.tokenService.generateTokens(
			{
				username: user.username,
				sub: {
					id: user._id,
					roles: user.roles,
					hasFinishedSetup: user.hasFinishedSetup,
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
