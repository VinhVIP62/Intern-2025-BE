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

		this.logger.error(
			`Exception Caught - ${req.method} ${req.url}`,
			exception instanceof Error ? exception.stack : String(exception),
		);

		const resolved = this.resolve(exception, req);
		return res.status(resolved.status).json(resolved.response);
	}

	private resolve(
		exception: unknown,
		req: Request,
	): {
		status: HttpStatus;
		response: ResponseEntity<null>;
	} {
		const lang = req.headers['accept-language'] || 'vi';

		// Nếu là Error, dùng message, còn lại fallback
		const rawMessage =
			exception instanceof Error ? exception.message
			: typeof exception === 'string' ? exception
			: 'common.internalServerError';

		// Giả định messageKey đã được định nghĩa trong i18n (ví dụ: common.internalServerError)
		const translatedMessage: string = this.i18n.translate(`exception.${rawMessage}`, { lang });

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
