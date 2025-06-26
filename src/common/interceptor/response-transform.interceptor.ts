import {
	IS_RES_TRANSFORM_KEY,
	ResponseTransformOptions,
} from '@common/decorators/response-transform.decorator';
import { ResponseEntity, PaginatedResponseEntity, PaginatedData } from '@common/types';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { catchError, map, Observable } from 'rxjs';
import { validateSync } from 'class-validator';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
	constructor(private reflector: Reflector) {}

	intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<any> | Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();
		const statusCode = response.statusCode;

		const transformOptions = this.reflector.getAllAndOverride<ResponseTransformOptions>(
			IS_RES_TRANSFORM_KEY,
			[context.getHandler(), context.getClass()],
		);

		const responseTransformer = <T>(data: T): ResponseEntity<T> | PaginatedResponseEntity<T> => {
			if (transformOptions?.pagination == true) {
				const err = validateSync(data as PaginatedData<any>);
				if (err.length) {
					throw new Error(
						'The `pagination` options only works with return type of PaginatedData<T>',
					);
				}
				const paginatedData = data as PaginatedData<T>;
				return new PaginatedResponseEntity<T>(request.url, statusCode, paginatedData);
			}

			return new ResponseEntity<T>(request.url, statusCode, data);
			return new ResponseEntity<T>(request.url, statusCode, data);
		};

		const ErrorTransformer = (err: Error) => {
			throw err;
		};

		return next.handle().pipe(map(responseTransformer), catchError(ErrorTransformer));
	}
}
