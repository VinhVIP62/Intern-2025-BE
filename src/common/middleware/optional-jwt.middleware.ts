import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/env.config';
import { AccessUser } from '@modules/auth/types/access-user.type';

@Injectable()
export class OptionalJwtMiddleware implements NestMiddleware {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<IEnvVars>,
	) {}

	use(req: Request, res: Response, next: NextFunction) {
		const authHeader = req.headers['authorization'];
		const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

		if (!token) {
			// Gán user = null bằng cách ép kiểu
			(req as any).user = null;
			return next();
		}

		try {
			const payload = this.jwtService.verify(token, {
				secret: this.configService.get('jwt', { infer: true })!.accessSecret,
			});

			// Gán vào req.user theo AccessUser type, ép kiểu để tránh lỗi
			(req as any).user = {
				id: payload.sub,
				email: payload.email,
				roles: payload.roles,
			} as AccessUser;
		} catch {
			(req as any).user = null; // Token sai → cho là guest
		}

		next();
	}
}
