import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/env.config';
import { TempPayload } from '../types/payload.type';
import { Unauthorized } from '@common/exceptions';

@Injectable()
export class JwtTempStrategy extends PassportStrategy(Strategy, 'temp-jwt') {
	constructor(configService: ConfigService<IEnvVars>) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('jwt', { infer: true })!.accessSecret,
		});
	}

	validate(payload: TempPayload) {
		if (payload.type !== 'temp' || !payload.verifiedEmail) {
			throw new Unauthorized('validation.auth.tempToken.invalid');
		}

		return {
			email: payload.sub,
			verifiedEmail: payload.verifiedEmail,
		};
	}
}
