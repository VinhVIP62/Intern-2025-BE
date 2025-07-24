import { createParamDecorator, ExecutionContext, Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export const PaginationQuery = <T>(QueryDtoClass: Type<T>) =>
	createParamDecorator((data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		const query = request.query;
		const dto = plainToInstance(QueryDtoClass, query, { enableImplicitConversion: true });

		// TODO: Uncomment this when we have a validation for the query
		// const errors = validateSync(dto as any, { whitelist: true, forbidNonWhitelisted: true });
		// if (errors.length > 0) {
		// 	// You can throw a custom error here if needed
		// 	throw errors[0];
		// }
		return dto;
	})();
