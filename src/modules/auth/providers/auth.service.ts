import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { UserService } from '@modules/user/providers/user.service';
import * as bcrypt from 'bcrypt';
import { Payload, Tokens } from '../types';
import { RegisterDto } from '../dto/register.dto';
import { User } from '@modules/user/entities/user.schema';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
	) {}

	async login(email: string, password: string): Promise<Tokens> {
		const user = await this.userService.findOneByEmail(email);
		if (!user) {
			throw new UnauthorizedException('Email not found');
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid password');
		}

		const tokens = await this.tokenService.generateTokens(
			{
				email: user.email,
				sub: {
					id: user._id as number,
					roles: user.roles,
				},
			},
			true,
		);

		return tokens;
	}

	async register(data: RegisterDto): Promise<Tokens> {
		const user = await this.userService.create(data as Partial<User>);

		const tokens = await this.tokenService.generateTokens(
			{
				email: user.email,
				sub: {
					id: user._id as number,
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
