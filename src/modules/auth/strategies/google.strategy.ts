import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { Strategy } from 'passport-google-oauth20';
import googleOauthConfig from '@configs/google-oauth.config';
import { ConfigType } from '@nestjs/config';
import { VerifiedCallback } from 'passport-jwt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject(googleOauthConfig.KEY)
		private googleConfiguration: ConfigType<typeof googleOauthConfig>,
	) {
		super({
			clientID: googleConfiguration.clientID!,
			clientSecret: googleConfiguration.clientSecret!,
			callbackURL: googleConfiguration.callbackURL!,
			scope: ['email', 'profile'],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any, done: VerifiedCallback) {
		console.log('Google profile:', profile);
	}
}
