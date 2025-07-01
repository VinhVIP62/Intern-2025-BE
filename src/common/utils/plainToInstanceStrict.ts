import { ClassTransformOptions, plainToInstance } from 'class-transformer';

import { Class } from '@common/types/utils';

/** `plainToInstance` wrapper function with `excludeExtraneousValues` set to `true` */
export function plainToInstanceStrict<T, V>(
	cls: Class<T>,
	plain: V[],
	options?: ClassTransformOptions,
): T[];

/** `plainToInstance` wrapper function with `excludeExtraneousValues` set to `true` */
export function plainToInstanceStrict<T, V>(
	cls: Class<T>,
	plain: V,
	options?: ClassTransformOptions,
): T;

/** `plainToInstance` wrapper function with `excludeExtraneousValues` set to `true` */
export function plainToInstanceStrict<T, V>(
	cls: Class<T>,
	plain: V | V[],
	options?: ClassTransformOptions,
) {
	return plainToInstance(cls, plain, { excludeExtraneousValues: true, ...options });
}
