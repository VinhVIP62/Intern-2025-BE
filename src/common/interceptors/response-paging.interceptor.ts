import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { I18nService } from 'nestjs-i18n';

export interface PaginatedResponse<T> {
	data: T[];
	message: string;
	statusCode: number;
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

@Injectable()
export class ResponsePagingInterceptor<T> implements NestInterceptor<T, PaginatedResponse<T>> {
	constructor(private readonly i18n: I18nService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<PaginatedResponse<T>> {
		const request = context.switchToHttp().getRequest();
		const lang = request.query.lang || 'en';

		return next.handle().pipe(
			switchMap(async (data: { items: T[]; total: number; page: number; limit: number }) => {
				const message = await this.i18n.translate('response.success', { lang });
				const totalPages = Math.ceil(data.total / data.limit);

				return {
					data: data.items,
					message,
					statusCode: context.switchToHttp().getResponse().statusCode,
					meta: {
						total: data.total,
						page: data.page,
						limit: data.limit,
						totalPages,
					},
				};
			}),
		);
	}
}
