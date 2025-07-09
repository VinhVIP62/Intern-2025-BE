import { ArgumentsHost, ExceptionFilter, HttpStatus, Catch } from '@nestjs/common';
import {
	CustomError,
	EntityNotFound,
	Forbidden,
	Unauthorized,
	Conflict,
	BadRequest,
	TooManyRequests,
	InternalServerError,
} from '@common/exceptions';
import { ResponseEntity } from '@common/types';
import { Response, Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AppLoggerService } from '@common/logger/logger.service';

@Catch(CustomError)
export class CustomExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly i18n: I18nService,
		private readonly logger: AppLoggerService,
	) {}

	catch(exception: CustomError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const res = ctx.getResponse<Response>();
		const req = ctx.getRequest<Request>();

		this.logger.error(`CustomException - ${req.method} ${req.url}`, exception.message);

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
		const lang = req.headers['accept-language'] || 'vi';

		// Translate using exception.message as key (e.g., "auth.emailAlreadyExists")
		const translated = this.i18n.translate<string>(`${exception.message}`, {
			lang,
			args: exception.args,
		}) as string;

		// Determine HTTP status
		if (exception instanceof EntityNotFound) {
			return this.response(HttpStatus.NOT_FOUND, translated);
		}

		if (exception instanceof Forbidden) {
			return this.response(HttpStatus.FORBIDDEN, translated);
		}

		if (exception instanceof Unauthorized) {
			return this.response(HttpStatus.UNAUTHORIZED, translated);
		}

		if (exception instanceof Conflict) {
			return this.response(HttpStatus.CONFLICT, translated);
		}

		if (exception instanceof BadRequest) {
			return this.response(HttpStatus.BAD_REQUEST, translated);
		}

		if (exception instanceof TooManyRequests) {
			return this.response(HttpStatus.TOO_MANY_REQUESTS, translated);
		}

		if (exception instanceof InternalServerError) {
			return this.response(HttpStatus.INTERNAL_SERVER_ERROR, translated);
		}

		return this.response(HttpStatus.INTERNAL_SERVER_ERROR, translated);
	}

	private response(
		status: HttpStatus,
		message: string,
	): {
		status: HttpStatus;
		response: ResponseEntity<null>;
	} {
		return {
			status,
			response: {
				success: false,
				error: message,
				data: null,
			},
		};
	}
}
