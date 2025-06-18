import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

interface ErrorResponse {
	statusCode: number;
	message: string;
	error: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(private readonly i18n: I18nService) {}

	async catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest();
		const status = exception.getStatus();
		const lang = request.query.lang || 'en';

		let errorResponse: ErrorResponse;

		try {
			const response = await exception.getResponse();
			errorResponse = response as ErrorResponse;
		} catch {
			const message = await this.i18n.translate('response.ERROR', { lang });
			errorResponse = {
				statusCode: status,
				message,
				error: exception.message,
			};
		}

		response.status(status).json(errorResponse);
	}
}
