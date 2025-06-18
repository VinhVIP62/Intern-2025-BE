import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ResponseInterceptor } from '../interceptors/response.interceptor';
import { ResponsePagingInterceptor } from '../interceptors/response-paging.interceptor';

export const Response = () => {
	return applyDecorators(UseInterceptors(ResponseInterceptor));
};

export const ResponsePaging = () => {
	return applyDecorators(UseInterceptors(ResponsePagingInterceptor));
};
