import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('jwt.secret') || 'secret',
		});
	}

	async validate(payload: { sub: string; email: string; roles: string[] }) {
		return await new Promise(r =>
			r({
				userId: payload.sub,
				email: payload.email,
				roles: payload.roles,
			}),
		);
	}
}
