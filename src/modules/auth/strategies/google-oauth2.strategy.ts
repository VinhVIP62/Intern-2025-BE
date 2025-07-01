import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { randomUUID } from 'node:crypto';
import { Profile, Strategy } from 'passport-google-oauth20';

import { IEnvVars } from '@configs/config';

import { UserService } from '@modules/user';
import { User } from '@modules/user/entities';

@Injectable()
export class GoogleOAuth2Strategy extends PassportStrategy(Strategy, 'google') {
	constructor(
		private readonly configService: ConfigService<IEnvVars>,
		private readonly userService: UserService,
	) {
		const env = configService.get('googleOAuth2', { infer: true })!;

		super({
			clientID: env.clientId,
			clientSecret: env.secret,
			callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
			scope: ['email', 'profile'],
		});
	}

	async validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
	): Promise<User | null> {
		const foundUsers = await this.userService.findAny({
			googleLoginInfo: { id: profile.id },
		});
		const foundLoginableUser = await this.userService.findLoginableAndRestore({
			googleLoginInfo: { id: profile.id },
		});
		if (!foundUsers.length) {
			const createdUser = await this.userService.create({
				avatarUrl: profile.photos?.[0]?.value || null,
				googleLoginInfo: { id: profile.id },
				hasFinishedSetup: false,
				mail: profile.emails?.[0]?.value || null,
				username: profile.username || profile.displayName.replace(/\s+/g, '') + randomUUID(),
				password: null,
			});
			return createdUser;
		}
		return foundLoginableUser;
	}
}
