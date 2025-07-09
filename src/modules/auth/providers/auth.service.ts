import {
	HttpStatus,
	Injectable,
	UnauthorizedException,
	UnprocessableEntityException,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { UserService } from '@modules/user/providers/user.service';
import * as bcrypt from 'bcrypt';
import { Payload, Tokens } from '../types';
import { CreateUserByExternalDto } from '@modules/user/dto';
import { RegisterDto } from '../dto/register.dto';
import { isEmail } from 'class-validator';
import { verificationService } from '../../../shared/verification/providers/verification.service';
import { OAuth2Client } from 'google-auth-library';
import { AuthGoogleLoginDto, LoginDto } from '../dto';
import { error } from 'console';

@Injectable()
export class AuthService {
	private google: OAuth2Client;

	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly otpService: verificationService,
	) {
		this.google = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
	}

	// async getProfileByToken(loginDto: AuthGoogleLoginDto) {
	// 	const ticket = await this.google.verifyIdToken({
	// 		idToken: loginDto.accessToken,
	// 		audience: process.env.GOOGLE_CLIENT_ID,
	// 	});
	// 	const payload = ticket.getPayload();
	// 	if (!payload) {
	// 		throw new UnprocessableEntityException({
	// 			status: HttpStatus.UNPROCESSABLE_ENTITY,
	// 			error: {
	// 				user: 'wrong token',
	// 			},
	// 		});
	// 	}

	// 	return {
	// 		id: payload.sub,
	// 		email: payload.email,
	// 		fullName: payload.name,
	// 		picture: payload.picture,
	// 	};
	// }
	// async validateGoogleUser(body: { id: string; email: string; fullName: string; picture: string }) {
	// 	const user = await this.userService.findByEmailOrNumber(body.email);
	// 	if (!user) {
	// 		const newUser = await this.userService.create({
	// 			emails: [body.email],
	// 			externalId: body.id,
	// 			externalType: 'google',
	// 			fullName: body.fullName,
	// 			avatar: body.picture,
	// 		});

	// 		const tokens = await this.tokenService.generateTokens(
	// 			{
	// 				email: body.email,
	// 				sub: {
	// 					id: newUser._id,
	// 					roles: newUser.roles,
	// 				},
	// 			},
	// 			true,
	// 		);
	// 		return tokens;
	// 	}
	// 	await this.userService.update(user._id, {
	// 		fullName: body.fullName,
	// 		avatar: body.picture,
	// 		externalId: body.id,
	// 		externalType: 'google',
	// 	});
	// 	const tokens = await this.tokenService.generateTokens(
	// 		{
	// 			email: body.email,
	// 			sub: {
	// 				id: user._id,
	// 				roles: user.roles,
	// 			},
	// 		},
	// 		true,
	// 	);
	// 	return tokens;
	// }

	async login(body: LoginDto): Promise<Tokens> {
		const user = await this.userService.findByEmailOrNumber(body.account);
		if (!user) {
			throw new UnauthorizedException('email or phonenumber not found');
		}
		//think about password

		const isPasswordValid = await this.userService.checkPassword(user._id, body.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid password');
		}
		if (isEmail(body.account)) {
			const tokens = await this.tokenService.generateTokens(
				{
					email: body.account,
					sub: {
						id: user._id,
						roles: user.roles,
					},
				},
				true,
			);
			return tokens;
		}
		const tokens = await this.tokenService.generateTokens(
			{
				phoneNumber: body.account,
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

	async loginByOtp(account: string) {
		const user = await this.userService.findByEmailOrNumber(account);
		if (!user) {
			throw new UnauthorizedException('email or phonenumber not found');
		}

		if (isEmail(account)) {
			const tokens = await this.tokenService.generateTokens(
				{
					email: account,
					sub: {
						id: user._id,
						roles: user.roles,
					},
				},
				true,
			);
			return tokens;
		}
		const tokens = await this.tokenService.generateTokens(
			{
				phoneNumber: account,
				sub: {
					id: user._id,
					roles: user.roles,
				},
			},
			true,
		);
		return tokens;
	}

	async register(data: RegisterDto): Promise<Tokens> {
		// Check if the user already exists
		if (!data.account) {
			throw new UnauthorizedException('Account input is required');
		}
		const exist = await this.userService.findByEmailOrNumber(data.account);
		if (exist) {
			throw new UnauthorizedException('User already exists');
		}

		//hash password
		const hashedPassword = await bcrypt.hash(data.password, 10);
		data.password = hashedPassword;

		const avatar =
			data.gender === 'male' ? process.env.AVATAR_MAN_DEFAULT : process.env.AVATAR_WOMAN_DEFAULT;
		// Mark user as unverified by default
		const userData = {
			...data,
			avatar: data.avatar || avatar,
		};

		const user = await this.userService.create(userData);

		if (isEmail(data.account)) {
			const tokens = await this.tokenService.generateTokens(
				{
					email: data.account,
					sub: {
						id: user._id,
						roles: user.roles,
					},
				},
				true,
			);
			return tokens;
		}
		const tokens = await this.tokenService.generateTokens(
			{
				phoneNumber: data.account,
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
		return await this.tokenService.generateTokens(payload, true);
	}
	// async validateGoogleUser(googleUser: CreateUserByExternalDto) {
	// 	const user = await this.userService.findByEmailOrNumber(googleUser.email);
	// 	if (!user) {
	// 		const newUser = await this.userService.create({
	// 			emails: [googleUser.email],
	// 			externalId: googleUser.externalId,
	// 			externalType: googleUser.externalType,
	// 		});

	// 		return newUser;
	// 	}

	// 	return user;
	// }
	async logout(accessToken: string, refreshToken: string) {}
	async googleCallback(user: any) {
		const tokens = await this.tokenService.generateTokens({
			email: user?.emails[0],
			phoneNumber: user?.phoneNumbers[0],
			sub: {
				id: user._id,
				roles: user.roles,
			},
		});
		return tokens;
	}

	async tokenForgotPassword(account: string, otp: string) {
		const user = await this.userService.findByEmailOrNumber(account);
		if (!user) {
			throw new UnauthorizedException('email or phonenumber not found');
		}

		const isOtpValid = await this.tokenService.generatePasswordChangeToken(user._id, account);
		return isOtpValid;
	}
	async changePasswordWithToken(token: string, newPassword: string) {
		const payload = await this.tokenService.validatePasswordChangeToken(token);
		const user = await this.userService.getUserById(payload.sub.userId);
		if (!user) {
			throw new UnauthorizedException('user not found');
		}
		await this.userService.updatePassword(user._id, newPassword);
		return {
			success: true,
			message: 'Password changed successfully',
		};
	}
	async changeForgotPasswordWithOtp(account: string, otp: string, newPassword: string) {
		try {
			const existOtp = await this.otpService.otpVerify(account, otp, 'forgot-password');
			if (!existOtp) {
				throw new UnauthorizedException('Invalid otp');
			}
			const user = await this.userService.findByEmailOrNumber(account);
			if (!user) {
				throw new UnauthorizedException('User not found');
			}
			await this.userService.updatePassword(user._id, newPassword);
			return {
				success: true,
				message: 'Password changed successfully',
			};
		} catch (error) {
			throw new UnauthorizedException('Invalid otp');
		}
	}
}
