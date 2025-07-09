import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus, Catch } from '@nestjs/common';
import { Response, Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AppLoggerService } from '@common/logger/logger.service';
import { ResponseEntity } from '@common/types';
import { ExceptionResponse } from '@common/types/exception-response.type';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly i18n: I18nService,
		private readonly logger: AppLoggerService,
	) {}

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const res = ctx.getResponse<Response>();
		const req = ctx.getRequest<Request>();

		// Log error
		this.logger.error(
			`HttpException - ${req.method} ${req.url}`,
			JSON.stringify(exception.getResponse()),
		);

		const resolved = this.resolve(exception, req);
		return res.status(resolved.status).json(resolved.response);
	}

	private resolve(
		exception: HttpException,
		req: Request,
	): {
		status: HttpStatus;
		response: ResponseEntity<null>;
	} {
		const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
		const lang = req.headers['accept-language'] || 'vi';

		const res = exception.getResponse() as ExceptionResponse;
		let rawMessage: string;

		if (typeof res === 'string') {
			rawMessage = res;
		} else if (Array.isArray(res.message)) {
			rawMessage = res.message[0];
		} else {
			rawMessage = res.message ?? 'Internal Server Error';
		}

		// Map một số message mặc định về key i18n
		const messageKey = this.mapMessageToKey(rawMessage);

		const translated = this.i18n.translate(`exception.common.${messageKey}`, { lang });

		return {
			status,
			response: {
				success: false,
				error: translated,
				data: null,
			},
		};
	}

	private mapMessageToKey(message: string): string {
		const normalized = message.trim().toLowerCase();

		switch (normalized) {
			case 'unauthorized':
			case 'you are not authorized to access this resource':
				return 'unauthorized';

			case 'forbidden':
			case 'forbidden resource':
				return 'forbidden';

			case 'bad request':
			case 'validation failed':
			case 'bad request exception':
			case 'invalid input':
				return 'badRequest';

			case 'not found':
			case 'resource not found':
			case 'cannot get /':
			case 'not found exception':
				return 'notFound';

			case 'conflict':
			case 'conflict exception':
			case 'data conflict':
				return 'conflict';

			case 'too many requests':
			case 'rate limit exceeded':
				return 'tooManyRequests';

			case 'internal server error':
			case 'internal error':
			case 'something went wrong':
			default:
				return 'internalServerError';
		}
	}
}
