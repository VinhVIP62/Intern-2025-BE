import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IEnvVars } from '@configs/config';

import { UserService } from '@modules/user';

import { Payload } from '../types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
	constructor(
		private readonly configService: ConfigService<IEnvVars>,
		private readonly userService: UserService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('jwt', { infer: true })!.refreshSecret,
		});
	}

	async validate(payload: Payload) {
		const user = await this.userService.findOneBy({
			id: payload.sub.id,
			roles: payload.sub.roles,
		});
		if (!user) throw new UnauthorizedException('Invalid or expired refresh token');
		return payload.sub;
	}
}
