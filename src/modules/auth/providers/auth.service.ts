import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { UserService } from '@modules/user/providers/user.service';
import * as bcrypt from 'bcrypt';
import { Payload, Tokens } from '../types';
import { CreateUserDto, CreateUserByExternalDto } from '@modules/user/dto';
import { RegisterDto } from '../dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
	) {}

	async login(accInput: string, password: string): Promise<Tokens> {
		const user = await this.userService.findByEmailOrNumber(accInput);
		if (!user) {
			throw new UnauthorizedException('email or phonenumber not found');
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid password');
		}

		const tokens = await this.tokenService.generateTokens(
			{
				email: user?.email,
				phoneNumber: user?.phoneNumber,
				sub: {
					id: user._id,
					roles: user.roles,
				},
			},
			true,
		);

		return tokens;
	}
	async loginByExternal() {}

	async register(data: RegisterDto): Promise<Tokens> {
		// Check if the user already exists
		if (!data.accInput) {
			throw new UnauthorizedException('Account input is required');
		}
		const exist = await this.userService.findByEmailOrNumber(data.accInput);
		if (exist) {
			throw new UnauthorizedException('User already exists');
		}

		const user = await this.userService.create(data);

		const tokens = await this.tokenService.generateTokens(
			{
				email: user?.email,
				phoneNumber: user?.phoneNumber,
				sub: {
					id: user._id,
					roles: user.roles,
				},
			},
			true,
		);
		return tokens;
	}

	async registerByExternal() {}

	async refreshToken(payload: Payload): Promise<Tokens> {
		return await this.tokenService.generateTokens(payload);
	}
	async validateGoogleUser(googleUser: CreateUserByExternalDto) {
		const user = await this.userService.findByEmailOrNumber(googleUser.email);
	}
}
