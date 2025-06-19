import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ResponsePagingInterceptor } from '../interceptors/responsePaging.interceptor';

export const ResponsePaging = () => applyDecorators(UseInterceptors(ResponsePagingInterceptor));
