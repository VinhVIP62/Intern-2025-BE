import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { UserService } from '@modules/user/providers/user.service';
import * as bcrypt from 'bcrypt';
import { Payload, Tokens } from '../types';
import { RegisterDto } from '../dto/register.dto';
import { User } from '@modules/user/entities/user.schema';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
	) {}

	async login(data: LoginDto): Promise<Tokens> {
		const user = await this.userService.findOneByEmail(data.email);
		if (!user) {
			throw new UnauthorizedException('Email not found');
		}

		const isPasswordValid = await bcrypt.compare(data.password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid password');
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

	async register(data: RegisterDto): Promise<Tokens> {
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

		return tokens;
	}

	async refreshToken(payload: Payload): Promise<Tokens> {
		return await this.tokenService.generateTokens(payload);
	}
}
