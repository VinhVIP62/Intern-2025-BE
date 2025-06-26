import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import { ResponseEntity } from '@common/types';
import { Response, Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AppLoggerService } from '@common/logger/logger.service';
import { ResponseTransform } from '@common/decorators/response-transform.decorator';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly i18n: I18nService,
		private readonly logger: AppLoggerService,
	) {}

	@ResponseTransform()
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const res = ctx.getResponse<Response>();
		const req = ctx.getRequest<Request>();

		const resolved = this.resolve(exception, req);

		this.logger.error(
			`Exception Caught - ${req.method} ${req.url}`,
			exception instanceof Error ? exception.stack : String(exception),
		);

		return res.status(resolved.statusCode).json(resolved);
	}

	private resolve(exception: HttpException, req: Request): ResponseEntity<null> {
		const excRes = exception.getResponse();
		const message =
			typeof excRes === 'string' ? excRes
			: 'message' in excRes ? (excRes.message as string)
			: 'Unable to parse HttpException message';

		const translatedMessage = this.i18n.translate('common.ERROR_MESSAGE', {
			lang: req.headers['accept-language'] || 'en',
			args: { message: message },
		});

		return new ResponseEntity<null>(
			req.url,
			exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR,
			null,
			translatedMessage,
		);
	}
}
