import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { I18nService } from 'nestjs-i18n';

export interface Response<T> {
	data: T;
	message: string;
	statusCode: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
	constructor(private readonly i18n: I18nService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
		const request = context.switchToHttp().getRequest();
		const lang = request.query.lang || 'en';

		return next.handle().pipe(
			switchMap(async data => {
				const message = await this.i18n.translate('response.success', { lang });
				return {
					data,
					message,
					statusCode: context.switchToHttp().getResponse().statusCode,
				};
			}),
		);
	}
}
