import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { Strategy } from 'passport-google-oauth20';
import googleOauthConfig from '@configs/google-oauth.config';
import { ConfigType } from '@nestjs/config';
import { VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../providers/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject(googleOauthConfig.KEY)
		private googleConfiguration: ConfigType<typeof googleOauthConfig>,
		private readonly authService: AuthService,
	) {
		super({
			clientID: googleConfiguration.clientID!,
			clientSecret: googleConfiguration.clientSecret!,
			callbackURL: googleConfiguration.callbackURL!,
			scope: ['email', 'profile'],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any, done: VerifiedCallback) {
		console.log('accessToken:', accessToken);
		// console.log('refreshToken:', refreshToken);
		console.log('Google profile:', profile);
		// const user = await this.authService.getProfileByToken({ accessToken });
		// done(null, user);
		// const user = await this.authService.validateGoogleUser({
		// 	email: profile.emails[0].value,
		// 	externalId: profile.id,
		// 	externalType: 'GOOGLE',
		// 	fullName: profile.displayName,
		// 	avatar: profile.photos[0].value,
		// 	verified: true,
		// 	gender: profile.gender,
		// });
		// done(null, user);
	}
}
