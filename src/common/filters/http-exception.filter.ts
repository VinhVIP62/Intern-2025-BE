import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import { ResponseEntity } from '@common/types';
import { Response, Request } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(private readonly i18n: I18nService) {}

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
		response: ResponseEntity<null>;
	} {
		return {
			status: exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR,
			response: {
				success: false,
				error: this.i18n.translate('common.ERROR_MESSAGE', {
					lang: req.headers['accept-language'] || 'en',
					args: { message: (exception.getResponse() as { message?: string })?.message },
				}),
				data: null,
			},
		};
	}
}
