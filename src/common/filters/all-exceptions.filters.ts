import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(private readonly i18n: I18nService) {}

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const status =
			exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		const rawMessage =
			exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

		const message =
			typeof rawMessage === 'object' && 'message' in rawMessage ? rawMessage.message : rawMessage;

		const translatedMessage = this.i18n.translate('common.ERROR_MESSAGE', {
			lang: request.headers['accept-language'] || 'en',
			args: { message: String(message) },
		});

		// Response format thống nhất
		response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			message: translatedMessage,
		});
	}
}
