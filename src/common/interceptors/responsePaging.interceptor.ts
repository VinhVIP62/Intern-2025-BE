// common/interceptors/response.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { I18nService } from 'nestjs-i18n';
import { ResponseEntity } from '@common/types';

export interface PagingMeta {
	totalItems: number;
	currentPage: number;
	itemsPerPage: number;
	totalPages: number;
}

@Injectable()
export class ResponsePagingInterceptor<T> implements NestInterceptor<T, any> {
	constructor(private readonly i18n: I18nService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const ctx = context.switchToHttp();
		const request = ctx.getRequest();
		const response = ctx.getResponse();
		const statusCode = response.statusCode || 200;
		const lang = request.headers['accept-language'] || 'en';

		return next.handle().pipe(
			map(data => ({
				statusCode,
				message: this.i18n.translate(data.data.message ? data.data.message : 'common.success', {
					lang: request.i18nLang,
				}),
				data: data.data.items || [],
				meta: {
					totalItems: data.data.meta?.totalItems || null,
					currentPage: data.data.meta?.currentPage || null,
					itemsPerPage: data.data.meta?.itemsPerPage || null,
					totalPages: data.data.meta?.totalPages || null,
				} as PagingMeta,
			})),
		);
	}
}
