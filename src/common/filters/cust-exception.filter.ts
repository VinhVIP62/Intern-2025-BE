import { ArgumentsHost, ExceptionFilter, HttpStatus, Catch } from '@nestjs/common';
import { CustomError, EntityNotFound } from '@common/exceptions';
import { ResponseEntity } from '@common/types';
import { Response, Request } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch(CustomError)
export class CustomExceptionFilter implements ExceptionFilter {
	constructor(private readonly i18n: I18nService) {}

	catch(exception: CustomError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const res = ctx.getResponse<Response>();
		const req = ctx.getRequest<Request>();

		const resolved = this.resolve(exception, req);
		return res.status(resolved.status).json({
			...resolved.response,
		});
	}

	private resolve(
		exception: CustomError,
		req: Request,
	): {
		status: HttpStatus;
		response: ResponseEntity<null>;
	} {
		exception.message = this.i18n.translate('common.ERROR_MESSAGE', {
			lang: req.headers['accept-language'] || 'en',
			args: { message: exception.message },
		});

		if (exception instanceof EntityNotFound) {
			return {
				status: HttpStatus.NOT_FOUND,
				response: {
					success: false,
					statusCode: HttpStatus.NOT_FOUND,
					error: exception.message,
					data: null,
				},
			};
		}
		return {
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			response: {
				success: false,
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				error: exception.message,
				data: null,
			},
		};
	}
}
