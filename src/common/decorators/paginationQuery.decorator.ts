import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const PaginationQuery = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	const page = request.query.page || 1;
	const limit = request.query.limit || 10;
	return { page, limit };
});
