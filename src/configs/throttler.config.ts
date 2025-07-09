import { ConfigService } from '@nestjs/config';
import { ThrottlerAsyncOptions } from '@nestjs/throttler';
import { IEnvVars } from './env.config';

export const ThrottlerConfig: ThrottlerAsyncOptions = {
	inject: [ConfigService],
	useFactory: (config: ConfigService<IEnvVars>) => [
		{
			name: 'default',
			ttl: (config.get<number>('throttlerTtl', { infer: true }) as number) ?? 60000,
			limit: (config.get<number>('throttlerLimit', { infer: true }) as number) ?? 100,
		},
		{
			name: 'short',
			ttl: 1000, // 1s
			limit: 5, // 5 requests per second
		},
		{
			name: 'medium',
			ttl: 10000, // 10s
			limit: 20,
		},
		{
			name: 'long',
			ttl: 60000, // 1 minute
			limit: 100,
		},
	],
};
