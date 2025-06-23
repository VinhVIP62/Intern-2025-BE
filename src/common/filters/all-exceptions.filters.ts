import { AppLoggerService } from '@common/logger/logger.service';
import { ResponseEntity } from '@common/types';
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly i18n: I18nService,
		private readonly logger: AppLoggerService,
	) {}

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const res = ctx.getResponse<Response>();
		const req = ctx.getRequest<Request>();

		const resolved = this.resolve(exception, req);

		this.logger.error(
			`Exception Caught - ${req.method} ${req.url}`,
			exception instanceof Error ? exception.stack : String(exception),
		);

		return res.status(resolved.status).json({
			...resolved.response,
		});
	}

	private resolve(
		exception: unknown,
		req: Request,
	): {
		status: HttpStatus;
		response: ResponseEntity<null>;
	} {
		const translatedMessage = this.i18n.translate('common.ERROR_MESSAGE', {
			lang: req.headers['accept-language'] || 'en',
			args: { message: String(exception) },
		});

		return {
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			response: {
				success: false,
				error: translatedMessage,
				data: null,
			},
		};
	}
}
