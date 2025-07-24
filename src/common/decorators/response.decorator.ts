import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { ResponsePagingInterceptor } from '@common/interceptors/response-paging.interceptor';

export const Response = () => {
	return applyDecorators(UseInterceptors(ResponseInterceptor));
};

export const ResponsePaging = () => {
	return applyDecorators(UseInterceptors(ResponsePagingInterceptor));
};
