import { SetMetadata } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

export class ResponseTransformOptions {
	/** Specifies if the response is paginated data. Throws an error if response is not of type PaginatedData<T> */
	pagination: boolean = false;
}
export const IS_RES_TRANSFORM_KEY = 'isResTransformKey';
export const ResponseTransform = (options?: Partial<ResponseTransformOptions>) =>
	SetMetadata(IS_RES_TRANSFORM_KEY, plainToInstance(ResponseTransformOptions, options));
