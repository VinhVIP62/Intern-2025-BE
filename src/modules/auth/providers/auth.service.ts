import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { UserService } from '@modules/user/providers/user.service';
import * as bcrypt from 'bcrypt';
import { Payload, Tokens } from '../types';
import { RegisterDto } from '../dto/register.dto';
import { User } from '@modules/user/entities/user.schema';
import { LoginDto } from '../dto/login.dto';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
	) {}

	async login(data: LoginDto, i18n?: I18nContext): Promise<Tokens> {
		const user = await this.userService.findOneByEmail(data.email);
		if (!user) {
			const message = i18n ? i18n.t('auth.INVALID_CREDENTIALS') : 'Email not found';
			throw new UnauthorizedException(message);
		}

		const isPasswordValid = await bcrypt.compare(data.password, user.password);
		if (!isPasswordValid) {
			const message = i18n ? i18n.t('auth.INVALID_CREDENTIALS') : 'Invalid password';
			throw new UnauthorizedException(message);
		}

		const tokens = await this.tokenService.generateTokens(
			{
				email: user.email,
				sub: {
					id: user._id as string,
					roles: user.roles,
				},
			},
			true,
		);

		// Save refToken to database
		await this.userService.update(user._id as string, { refToken: tokens.refreshToken });

		return tokens;
	}

	async register(data: RegisterDto, i18n?: I18nContext): Promise<Tokens> {
		// Check if user already exists
		const existingUser = await this.userService.findOneByEmail(data.email);
		if (existingUser) {
			const message = i18n ? i18n.t('auth.EMAIL_ALREADY_EXISTS') : 'Email already exists';
			throw new UnauthorizedException(message);
		}

		const user = await this.userService.create(data as Partial<User>);

		const tokens = await this.tokenService.generateTokens(
			{
				email: user.email,
				sub: {
					id: user._id as string,
					roles: user.roles,
				},
			},
			true,
		);

		// Save refToken to database
		await this.userService.update(user._id as string, { refToken: tokens.refreshToken });

		return tokens;
	}

	async refreshToken(payload: Payload): Promise<Tokens> {
		return await this.tokenService.generateTokens(payload);
	}
}
