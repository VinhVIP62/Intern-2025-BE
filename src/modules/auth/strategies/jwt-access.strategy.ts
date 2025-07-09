import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/env.config';
import { AccessPayload } from '../types/payload.type';
import { Unauthorized } from '@common/exceptions';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access-jwt') {
	constructor(configService: ConfigService<IEnvVars>) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('jwt', { infer: true })!.accessSecret,
		});
	}

	validate(payload: AccessPayload) {
		if (!payload || payload.type !== 'access') {
			throw new Unauthorized('validation.auth.accessToken.invalid');
		}

		return {
			id: payload.sub,
			email: payload.email,
			roles: payload.roles,
		};
	}
}
