import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { isEmpty, isPhoneNumber } from 'class-validator';

import { UserService } from '@modules/user';
import { User } from '@modules/user/entities';

import { Payload, Tokens, createPayload } from '../types';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly tokenService: TokenService,
		private readonly userService: UserService,
	) {}

	async login(id: string, password: string): Promise<Tokens> {
		const user = await this.validateWithPhoneOrMail(id, password);
		const tokens = await this.tokenService.generateTokens(createPayload(user), true);
		return tokens;
	}

	async register(username: string, password: string, mail: string, phone: string): Promise<Tokens> {
		const user = await this.userService.create({ username, password, mail, phone });
		const tokens = await this.tokenService.generateTokens(createPayload(user), true);
		return tokens;
	}

	async loginWithGoogle(user: User) {
		const tokens = await this.tokenService.generateTokens(createPayload(user), true);
		return tokens;
	}

	async validateWithPhoneOrMail(id: string, password: string): Promise<User> {
		if (isEmpty(password)) throw new UnauthorizedException(`Please provide non-empty password.`);
		const isLoggedInViaPhone = isPhoneNumber(id);
		const findOptions = isPhoneNumber(id) ? { phone: id } : { mail: id };
		const user = await this.userService.findLoginableAndRestore(findOptions);
		if (!user) {
			throw new UnauthorizedException(
				`${isLoggedInViaPhone ? 'Phone number' : 'Email'} not found or your account has been deactivated`,
			);
		}
		const isPasswordValid =
			user.password !== null && (await bcrypt.compare(password, user.password));
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid password');
		}
		return user;
	}

	async refreshToken(payload: Payload): Promise<Tokens> {
		return await this.tokenService.generateTokens(payload);
	}
}
