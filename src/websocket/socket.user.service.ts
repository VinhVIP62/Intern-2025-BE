import type { Redis } from 'ioredis';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class SocketUserService {
	constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

	async addSocket(userId: string, socketId: string) {
		await this.redis.sadd(`socket_user:${userId}`, socketId);
	}

	async removeSocket(userId: string, socketId: string) {
		await this.redis.srem(`socket_user:${userId}`, socketId);
		const count = await this.redis.scard(`socket_user:${userId}`);
		if (count === 0) await this.redis.del(`socket_user:${userId}`);
	}

	async getSockets(userId: string): Promise<string[]> {
		return await this.redis.smembers(`socket_user:${userId}`);
	}
}
