import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response.decorator';
import { RESPONSE_PAGING_META } from '../decorators/response-paging.decorator';
import { Request } from 'express';
import { isPaginatedResponse } from '@common/utils/type-guards';

@Injectable()
export class ResponseCompositeInterceptor implements NestInterceptor {
	constructor(
		private readonly reflector: Reflector,
		private readonly i18n: I18nService,
	) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest<
			Request & {
				i18nLang?: string;
				i18nArgs?: Record<string, any>;
			}
		>();

		const lang = request.i18nLang || 'en';
		const args = request.i18nArgs;

		const pagingMessageKey =
			this.reflector.get<string>(RESPONSE_PAGING_META, context.getHandler()) ||
			'common.response.paginate.success';

		const normalMessageKey = this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler());

		return next.handle().pipe(
			mergeMap((response: unknown) => {
				if (isPaginatedResponse(response)) {
					return from(this.buildPaginatedResponse(response, lang, pagingMessageKey));
				}

				return from(this.buildNormalResponse(response, lang, normalMessageKey, args));
			}),
		);
	}

	private async buildPaginatedResponse(
		response: unknown,
		lang: string,
		key: string,
	): Promise<{ message?: string; data: unknown; meta: unknown }> {
		let message: string | undefined = undefined;
		if (key) {
			message = await this.i18n.translate(key, { lang });
		}

		const res = response as { items: unknown; meta: unknown };

		return {
			message,
			data: res.items,
			meta: res.meta,
		};
	}

	private async buildNormalResponse(
		response: unknown,
		lang: string,
		key?: string,
		args?: Record<string, any>,
	): Promise<{ message?: string; data: unknown }> {
		let message: string | undefined = undefined;
		if (key) {
			message = await this.i18n.translate(key, { lang, args });
		}

		return {
			message,
			data: response,
		};
	}
}
