import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '@modules/user/providers/user.service';
import { ForgotPasswordDto } from '../dto/request/forgot-password.dto';
import { MailService } from '@modules/mail/providers/mail.service';
import type { Redis } from 'ioredis';
import { OtpCodeDto } from '../dto/request/otpCode.dto';
import { OtpResponseDto } from '../dto/response/otpResponse.dto';
import { VerifyOtpResponseDto } from '../dto/response/verifyOtpResponse.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class OtpService {
	constructor(
		@Inject('REDIS_CLIENT') private readonly redis: Redis,
		private readonly userService: UserService,
		private readonly mailService: MailService, // Assuming you have a MailService to send OTP emails
	) {}

	generateOtp(): string {
		return Math.floor(100000 + Math.random() * 900000).toString(); // 6 số
	}

	async saveOtp(key: string, otp: string, ttl = 60): Promise<void> {
		try {
			await this.redis.set(`otp:${key}`, otp, 'EX', ttl);
			const test = await this.redis.get(`otp:${key}`);
			console.log(`[REDIS CHECK] otp:${key} = ${test}`);
		} catch (error) {
			console.error('[REDIS] Error saving OTP:', error);
		}
	}

	async verifyOtp(key: string, otp: string): Promise<boolean> {
		const saved = await this.redis.get(`otp:${key}`);
		return saved === otp;
	}

	async invalidateOtp(key: string) {
		await this.redis.del(`otp:${key}`);
	}

	async requestOtp(forgotPasswordDto: ForgotPasswordDto): Promise<OtpResponseDto> {
		const { email } = forgotPasswordDto;
		const user = await this.userService.findOneByEmail(email);
		if (!user) {
			throw new Error('error.userNotFound');
		}
		const existingOtp = await this.redis.get(`otp:${user.email}`);
		if (existingOtp) {
			console.log(`[REDIS] Existing OTP found for ${user.email}, invalidating it.`);
			await this.invalidateOtp(user.email);
		}
		const otp = this.generateOtp();
		await this.saveOtp(user.email, otp);
		await this.mailService.sendOtp(user.email, otp);
		const res = new OtpResponseDto();
		res.message = 'otp.sent';
		return res;
	}

	async verifyOtpCode(otpCodeDto: OtpCodeDto): Promise<VerifyOtpResponseDto> {
		const res = new VerifyOtpResponseDto();
		const { email, otp } = otpCodeDto;
		const isValid = await this.verifyOtp(email, otp);
		if (!isValid) {
			res.message = 'otp.invalid';
		} else {
			await this.invalidateOtp(email);
			const token = randomBytes(32).toString('hex');
			await this.redis.set(`resetToken:${token}`, email, 'EX', 60 * 5);
			res.message = 'otp.verified';
			res.resetPasswordToken = token;
		}
		res.isValid = isValid;
		return res;
	}
}
