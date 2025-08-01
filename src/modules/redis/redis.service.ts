import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { createClient, RedisClientType } from 'redis';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService {
	private readonly logger = new Logger(RedisService.name);
	// private client: RedisClientType; use redis local with docker
	private client: Redis;

	constructor(private configService: ConfigService<any>) {}

	async onModuleInit() {
		// use redis local with docker
		// this.client = createClient({
		// 	socket: {
		// 		host: this.configService.get('REDIS_HOST') || 'localhost',
		// 		port: this.configService.get('REDIS_PORT') || 6379,
		// 	},
		// 	password: this.configService.get('REDIS_PASSWORD'),
		// });

		this.client = Redis.fromEnv();
		//test connection
		try {
			await this.client.ping();
			this.logger.log('Connected to Upstash Redis');
		} catch (error) {
			this.logger.error('Failed to connect to Upstash Redis:', error);
		}

		//use with redis local with docker
		// this.client.on('error', err => {
		// 	this.logger.error('Redis Client Error:', err);
		// });

		// this.client.on('connect', () => {
		// 	this.logger.log('Connected to Redis');
		// });

		// await this.client.connect();
	}

	// use with redis local with docker
	// async onModuleDestroy() {
	// 	if (this.client) {
	// 		await this.client.quit();
	// 	}
	// }

	// Online user management methods with redis local with docker
	// async addOnlineUser(userId: string, socketId: string): Promise<void> {
	// 	await this.client.hSet('online_users', userId, socketId);
	// 	await this.client.set(`socket:${socketId}:user`, userId, { EX: 3600 }); // 1 hour
	// }

	// Online user management methods with upstash redis
	async addOnlineUser(userId: string, socketId: string): Promise<void> {
		await this.client.hset('online_users', { [userId]: socketId });
		await this.client.set(`socket:${socketId}:user`, userId, { ex: 3600 }); // 1 hour
	}

	// with redis local with docker
	// async removeOnlineUser(userId: string): Promise<void> {
	// 	await this.client.hDel('online_users', userId);
	// }

	// with upstash redis
	async removeOnlineUser(userId: string): Promise<void> {
		await this.client.hdel('online_users', userId);
	}

	// with redis local with docker
	// async getOnlineUsers(): Promise<string[]> {
	// 	const users = await this.client.hKeys('online_users');
	// 	return users;
	// }

	// with upstash redis
	async getOnlineUsers(): Promise<string[]> {
		const users = await this.client.hkeys('online_users');
		return users;
	}

	// with redis local with docker
	// async getUserBySocketId(socketId: string): Promise<string | null> {
	// 	return await this.client.get(`socket:${socketId}:user`);
	// }

	// async removeSocketMapping(socketId: string): Promise<void> {
	// 	const userId = await this.getUserBySocketId(socketId);
	// 	if (userId) {
	// 		await this.client.hDel('online_users', userId);
	// 		await this.client.del(`socket:${socketId}:user`);
	// 	}
	// }

	// with upstash redis
	async getUserBySocketId(socketId: string): Promise<string | null> {
		return await this.client.get(`socket:${socketId}:user`);
	}

	async removeSocketMapping(socketId: string): Promise<void> {
		const userId = await this.getUserBySocketId(socketId);
		if (userId) {
			await this.client.hdel('online_users', userId);
			await this.client.del(`socket:${socketId}:user`);
		}
	}

	// General Redis operations
	// with redis local with docker
	// async set(key: string, value: string, ttl?: number): Promise<void> {
	// 	if (ttl) {
	// 		await this.client.set(key, value, { EX: ttl });
	// 	} else {
	// 		await this.client.set(key, value);
	// 	}
	// }

	// with upstash redis
	async set(key: string, value: string, ttl?: number): Promise<void> {
		if (ttl) {
			await this.client.set(key, value, { ex: ttl });
		} else {
			await this.client.set(key, value);
		}
	}

	// with redis local with docker
	async get(key: string): Promise<string | null> {
		return await this.client.get(key);
	}

	// with redis local with docker
	async del(key: string): Promise<void> {
		await this.client.del(key);
	}

	// with redis local with docker
	async ttl(key: string): Promise<number> {
		return await this.client.ttl(key);
	}

	// with redis local with docker
	async incr(key: string): Promise<number> {
		return await this.client.incr(key);
	}
}
