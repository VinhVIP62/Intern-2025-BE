// common/interceptors/response.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { I18nService } from 'nestjs-i18n';
import { ResponseEntity } from '@common/types';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
	constructor(private readonly i18n: I18nService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseEntity<T>> {
		const ctx = context.switchToHttp();
		const request = ctx.getRequest();
		const response = ctx.getResponse();
		const statusCode = response.statusCode || 200;
		const lang = request.headers['accept-language'] || 'en';
		const message = this.i18n.translate('common.success', {
			lang: request.i18nLang,
		});

		return next.handle().pipe(
			map(data => ({
				statusCode,
				message,
				data: data.data || null,
			})),
		);
	}
}
