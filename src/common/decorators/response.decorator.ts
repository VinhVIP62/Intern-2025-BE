import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ResponseInterceptor } from '../interceptors/response.interceptor';

export const Response = () => applyDecorators(UseInterceptors(ResponseInterceptor));
