import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/env.config';
import { RefreshPayload } from '../types/payload.type';
import { Unauthorized } from '@common/exceptions';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
	constructor(configService: ConfigService<IEnvVars>) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('jwt', { infer: true })!.refreshSecret,
			passReqToCallback: true,
		});
	}

	validate(req: Request, payload: RefreshPayload) {
		if (payload.type !== 'refresh') {
			throw new Unauthorized('validation.auth.refreshToken.invalid');
		}

		const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
		return { id: payload.sub, email: payload.email, roles: payload.roles, refreshToken: token };
	}
}
