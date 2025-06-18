import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { HttpExceptionError } from './HttpException.error';

export class BadRequestException extends HttpExceptionError {
	constructor(
		i18n: I18nService,
		lang: string,
		key: string = 'BAD_REQUEST',
		args?: Record<string, any>,
	) {
		super(i18n, lang, key, args, HttpStatus.BAD_REQUEST);
	}
}
