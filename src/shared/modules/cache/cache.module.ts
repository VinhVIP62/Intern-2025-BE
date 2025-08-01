import KeyvRedis from '@keyv/redis';
import { Global, Module } from '@nestjs/common';
import Keyv from 'keyv';

@Global()
@Module({
	providers: [
		{
			provide: 'KEYV_INSTANCE',
			useFactory: () => {
				const keyv = new Keyv({
					store: new KeyvRedis('redis://redis:6379'),
				});

				keyv.on('error', err => console.error('Keyv Redis Error:', err));

				return keyv;
			},
		},
	],
	exports: ['KEYV_INSTANCE'],
})
export class KeyvRedisModule {}
