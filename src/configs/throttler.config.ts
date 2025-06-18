import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = {
	throttlers: [
		{
			ttl: 60, // Time window in seconds
			limit: 10, // Maximum number of requests per ttl
		},
	],
};
