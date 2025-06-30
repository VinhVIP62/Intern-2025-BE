// common/interceptors/response.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { I18nService } from 'nestjs-i18n';
import { ResponseEntity } from '@common/types';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
	constructor(private readonly i18n: I18nService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const ctx = context.switchToHttp();
		const request = ctx.getRequest();
		const response = ctx.getResponse();
		const statusCode = response.statusCode || 200;
		const lang = request.headers['accept-language'] || 'en';

		return next.handle().pipe(
			map(data => {
				let messageKey = 'common.success';
				if (data?.data?.message) {
					messageKey = data.data.message;
					delete data.data.message;
				}
				return {
					statusCode,
					message: this.i18n.translate(messageKey, {
						lang: request.i18nLang,
					}),
					data: data.data || null,
				};
			}),
		);
	}
}
