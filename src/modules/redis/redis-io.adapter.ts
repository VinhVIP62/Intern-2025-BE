import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
// import { createClient } from 'redis';
import { Redis } from '@upstash/redis';
import { ConfigService } from '@nestjs/config';
import { INestApplicationContext } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
	private adapterConstructor: ReturnType<typeof createAdapter>;

	constructor(
		app: INestApplicationContext,
		private configService: ConfigService<any>,
	) {
		super(app);
	}

	async connectToRedis(): Promise<void> {
		// const pubClient = createClient({
		// 	socket: {
		// 		host: this.configService.get('REDIS_HOST') || 'localhost',
		// 		port: this.configService.get('REDIS_PORT') || 6379,
		// 	},
		// 	password: this.configService.get('REDIS_PASSWORD'),
		// });

		const pubClient = Redis.fromEnv();

		const subClient = Redis.fromEnv();
		// const subClient = pubClient.duplicate();

		// await Promise.all([pubClient.connect(), subClient.connect()]);

		this.adapterConstructor = createAdapter(pubClient, subClient);
	}

	createIOServer(port: number, options?: ServerOptions): any {
		const server = super.createIOServer(port, options);
		server.adapter(this.adapterConstructor);
		return server;
	}
}
