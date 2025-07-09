import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { I18nValidationException } from 'nestjs-i18n';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

import { Request } from 'express';

interface CustomRequest extends Request {
	i18nLang?: string;
	i18nArgs?: Record<string, any>;
}

@Catch(I18nValidationException)
export class I18nValidationExceptionFilter implements ExceptionFilter {
	constructor(private readonly i18n: I18nService) {}

	async catch(exception: I18nValidationException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<CustomRequest>();

		const lang = request.i18nLang || 'vi';

		const translatedErrors = await Promise.all(
			exception.errors.map(async error => {
				const translatedConstraints: Record<string, string> = {};
				for (const [key, value] of Object.entries(error.constraints || {})) {
					translatedConstraints[key] = await this.i18n.translate(value, { lang });
				}

				return {
					property: error.property,
					constraints: translatedConstraints,
				};
			}),
		);

		response.status(400).json({
			success: false,
			error: 'validation.error',
			data: translatedErrors,
		});
	}
}
