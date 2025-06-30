import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import { ResponseEntity } from '@common/types';
import { Response, Request } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(private readonly i18n: I18nService) {}

	private getMessageKey(exception: HttpException): string {
		const res = exception.getResponse();
		// Trường hợp getResponse() là string
		if (typeof res === 'string') return res;

		// Trường hợp getResponse() là object có .message
		if (typeof res === 'object' && typeof (res as any).message === 'string') {
			return (res as any).message;
		}

		// Fallback mặc định cho 500
		return 'error.INTERNAL_SERVER_ERROR';
	}

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const res = ctx.getResponse<Response>();
		const req = ctx.getRequest<Request>();

		const resolved = this.resolve(exception, req);
		return res.status(resolved.status).json({
			...resolved.response,
		});
	}

	private resolve(
		exception: HttpException,
		req: Request,
	): {
		status: HttpStatus;
		response: any;
	} {
		const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
		const messageKey = this.getMessageKey(exception);

		return {
			status: status,
			response: {
				success: false,
				statusCode: status,
				error: this.i18n.translate(messageKey, {
					lang: req.headers['accept-language'] || 'en',
				}),
				data: null,
			},
		};
	}
}
