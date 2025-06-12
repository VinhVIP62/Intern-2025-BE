import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { UserService } from '@modules/user/providers/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly jwtService: JwtService,
	) {}

	async login(email: string, password: string) {
		const user = await this.userService.findByEmail(email);
		if (!user) {
			throw new UnauthorizedException('Email not found');
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid password');
		}

		const { accessToken, refreshToken } = await this.tokenService.generateTokens(
			user._id,
			user.email,
			user.roles,
		);
		// update the refresh token in the database
		await this.userService.updateRefreshToken(user._id, refreshToken);

		return { accessToken, refreshToken };
	}

	async register(userData: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
	}) {
		const hashedPassword = await bcrypt.hash(userData.password, 10);
		const user = await this.userService.create({
			...userData,
			password: hashedPassword,
		});
		const { accessToken, refreshToken } = await this.tokenService.generateTokens(
			user._id,
			user.email,
			user.roles,
		);
		// update the refresh token in the database
		await this.userService.updateRefreshToken(user._id, refreshToken);

		return { accessToken, refreshToken };
	}

	async refreshToken(refToken: string) {
		const user = await this.userService.findByRefreshToken(refToken);
		if (!user) {
			throw new UnauthorizedException('Invalid refresh token');
		}

		// await this.tokenService.revokeRefreshToken(refreshToken);

		const { accessToken, refreshToken } = await this.tokenService.generateTokens(
			user._id,
			user.email,
			user.roles,
		);
		// update the refresh token in the database
		await this.userService.updateRefreshToken(user._id, refreshToken);

		return { accessToken, refreshToken };
	}

	async logout(refreshToken: string) {
		await this.tokenService.revokeRefreshToken(refreshToken);
		return { message: 'Logged out successfully' };
	}
}
