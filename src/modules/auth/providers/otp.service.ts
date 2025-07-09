import { Injectable } from '@nestjs/common';
import { redisClient } from '@common/providers/redis.provider';

@Injectable()
export class OtpService {
	generateOtp(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	async saveOtp(email: string, code: string, type: 'verify' | 'reset', ttlSeconds = 300) {
		await redisClient.set(`otp:${type}:${email}`, code, 'EX', ttlSeconds);
	}

	async verifyOtp(email: string, code: string, type: 'verify' | 'reset'): Promise<boolean> {
		const key = `otp:${type}:${email}`;
		const storedCode = await redisClient.get(key);

		if (storedCode !== code) return false;

		await redisClient.del(key); // one-time use
		return true;
	}
}
