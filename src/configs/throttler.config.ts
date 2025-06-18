import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = {
	throttlers: [
		{
			ttl: Number(process.env.THROTTLE_TTL) || 60, // Time window in seconds
			limit: Number(process.env.THROTTLE_LIMIT) || 10, // Maximum number of requests per ttl
		},
	],
};
