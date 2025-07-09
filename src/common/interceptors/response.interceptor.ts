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
			map(data => {
				// If the response is already formatted by exception filters
				// (has success field and statusCode), don't transform it
				if (data && typeof data === 'object' && 'success' in data && 'statusCode' in data) {
					return data;
				}

				// If data already has expected controller structure with success and data fields
				if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
					return {
						success: data.success,
						statusCode,
						message: data.message || message,
						data: data.data,
					};
				}

				// If data has data field but no success field (some controllers)
				if (data && typeof data === 'object' && 'data' in data && !('success' in data)) {
					return {
						success: true,
						statusCode,
						message: data.message || message,
						data: data.data,
					};
				}

				// For raw data responses, wrap them
				return {
					success: true,
					statusCode,
					message,
					data: data,
				};
			}),
		);
	}
}
