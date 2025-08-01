import KeyvRedis from '@keyv/redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import Keyv from 'keyv';

import type { IEnvVars } from '@configs/config';

@Injectable()
export class TokenStoreService {
	private keyv: Keyv;
	private redis: Redis;

	constructor(private configService: ConfigService<IEnvVars>) {
		const redisUri = configService.get('redis.uri', { infer: true })!;
		this.keyv = new Keyv({ store: new KeyvRedis(redisUri) });
		this.redis = new Redis(redisUri);

		this.keyv.on('error', err => console.error('Keyv error', err));
		this.redis.on('error', err => console.error('Redis error', err));
	}

	async addToken(userId: string, token: string, ttlSeconds: number) {
		await this.keyv.set(`accessToken:${token}`, userId, ttlSeconds * 1000);
		await this.redis.sadd(`userTokens:${userId}`, token);
		await this.redis.expire(`userTokens:${userId}`, ttlSeconds);
	}

	async removeToken(userId: string, token: string) {
		await this.keyv.delete(`accessToken:${token}`);
		await this.redis.srem(`userTokens:${userId}`, token);
	}

	async getTokensByUser(userId: string): Promise<string[]> {
		const tokens = await this.redis.smembers(`userTokens:${userId}`);
		if (tokens.length === 0) return [];

		const pipeline = this.redis.pipeline();
		tokens.forEach(token => {
			pipeline.exists(`accessToken:${token}`);
		});

		const results = await pipeline.exec();

		if (!results) {
			console.error('Redis pipeline returned null');
			return [];
		}

		const validTokens: string[] = [];

		for (let i = 0; i < tokens.length; i++) {
			const [err, exists] = results[i];
			if (err) {
				console.error('Redis pipeline error:', err);
				continue;
			}

			if (exists === 1) {
				validTokens.push(tokens[i]);
			} else {
				await this.redis.srem(`userTokens:${userId}`, tokens[i]);
			}
		}

		return validTokens;
	}

	async isTokenValid(token: string): Promise<boolean> {
		const userId = (await this.keyv.get(`accessToken:${token}`)) as string;
		return !!userId;
	}

	async invalidateAccessTokensOf(userId: string): Promise<void> {
		const tokens = await this.getTokensByUser(userId);
		if (tokens.length === 0) return;

		const pipeline = this.redis.pipeline();
		tokens.forEach(token => {
			pipeline.del(`accessToken:${token}`);
			pipeline.srem(`userTokens:${userId}`, token);
		});

		await pipeline.exec();
	}
}
