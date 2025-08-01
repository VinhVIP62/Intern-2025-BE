import { Provider } from '@nestjs/common';
import { Redis } from '@upstash/redis';

// Tạo một injection token tùy chỉnh
export const UPSTASH_REDIS_CLIENT = 'UPSTASH_REDIS_CLIENT';

export const upstashRedisProvider: Provider = {
	provide: UPSTASH_REDIS_CLIENT,
	useFactory: () => {
		const client = new Redis({
			url: process.env.UPSTASH_REDIS_REST_URL,
			token: process.env.UPSTASH_REDIS_REST_TOKEN,
		});
		return client;
	},
};
