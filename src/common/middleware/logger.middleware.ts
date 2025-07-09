import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction, Request } from 'express';
import { AppLoggerService } from '@common/logger/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	constructor(private readonly logger: AppLoggerService) {}

	use(req: Request, res: Response, next: NextFunction): void {
		const { method, originalUrl, ip } = req;
		const startTime = Date.now();

		res.on('finish', () => {
			const duration = Date.now() - startTime;
			const statusCode = res.statusCode;

			// userId từ JWT nếu có
			const userId = req.user?.id || 'Guest';

			this.logger.log(
				`${method} ${originalUrl} ${statusCode} - ${duration}ms - userId=${userId} - ip=${ip}`,
				'HTTP',
			);
		});

		next();
	}
}
