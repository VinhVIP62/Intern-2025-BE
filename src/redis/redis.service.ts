import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import Redis from 'ioredis';

export const RedisService: Provider = {
	provide: 'REDIS_CLIENT',
	inject: [ConfigService],
	useFactory: (configService: ConfigService): Redis => {
		return new Redis({
			host: configService.get('REDIS_HOST') || 'localhost',
			port: configService.get('REDIS_PORT') || 6379,
			password: configService.get('REDIS_PASSWORD'),
			username: configService.get('REDIS_USERNAME'),
		});
	},
};
