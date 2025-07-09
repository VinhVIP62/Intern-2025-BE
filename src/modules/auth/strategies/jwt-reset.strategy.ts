import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/env.config';
import { ResetPayload } from '../types/payload.type';
import { Unauthorized } from '@common/exceptions';

@Injectable()
export class JwtResetPasswordStrategy extends PassportStrategy(Strategy, 'reset-jwt') {
	constructor(configService: ConfigService<IEnvVars>) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('jwt', { infer: true })!.accessSecret,
		});
	}

	validate(payload: ResetPayload) {
		if (payload.type !== 'reset' || !payload.sub) {
			throw new Unauthorized('validation.auth.resetPasswordToken.invalid');
		}

		return {
			id: payload.sub,
			email: payload.email,
		};
	}
}
