import { Injectable } from '@nestjs/common';
import { isEmail } from 'validator';
import * as nodemailer from 'nodemailer';

import { UserService } from '@modules/user/providers/user.service';
import * as bcrypt from 'bcrypt';
import { OTPType } from '@modules/auth/enum/otp.enum';
import { RedisService } from '../../../modules/redis/redis.service';

@Injectable()
export class verificationService {
	constructor(
		private readonly userService: UserService, // **IMPORTANT**: Inject UserService
		private readonly redisService: RedisService,
	) {}
	//send otp to user, check exist mail or phonenumber
	async requestOtp(accInput: string, otpType: string) {
		const rateLimit = await this.checkOTPRateLimit(accInput);
		if (!rateLimit.allowed) {
			throw new Error(rateLimit.message);
		}
		// Kiểm tra trạng thái tài khoản theo loại OTP
		if (!Object.values(OTPType).includes(otpType as OTPType)) {
			throw new Error('OTP type is not included');
		}
		const user = await this.userService.findByEmailOrNumber(accInput);
		if ((otpType === OTPType.LOGIN || otpType === OTPType.FORGOT_PASSWORD) && !user) {
			throw new Error('Tài khoản không tồn tại.');
		}
		if (otpType === OTPType.ADD_EMAIL && !isEmail(accInput)) {
			throw new Error('OTP type is not correct');
		}
		if (otpType === OTPType.ADD_PHONE && isEmail(accInput)) {
			throw new Error('OTP type is not correct');
		}
		if (
			(otpType === OTPType.REGISTER ||
				otpType === OTPType.ADD_EMAIL ||
				otpType === OTPType.ADD_PHONE) &&
			user
		) {
			throw new Error('Tài khoản đã tồn tại.');
		}

		// Sinh OTP và lưu vào redis
		const otp = this.generateOtp();
		const hashedOtp = await bcrypt.hash(otp, 10);

		// Lưu OTP vào redis with key format
		const key = `otp:${accInput}:${otpType}`;

		await this.redisService.set(key, hashedOtp, 5 * 60);

		// Gửi OTP (mail/sms)
		await this.sendOtp(accInput, otp);

		return 'A new OTP has been sent successfully.';
	}
	//create user if not exists
	async otpVerify(accInput: string, otp: string, otpType: string) {
		const rateLimit = await this.checkOTPRateLimit(accInput);
		if (!rateLimit.allowed) {
			throw new Error(rateLimit.message);
		}
		const key = `otp:${accInput}:${otpType}`;
		const existingOtp = await this.redisService.get(key);
		if (!existingOtp) {
			throw new Error('OTP not found. Please request a new OTP.');
		}
		const isOtpValid = await bcrypt.compare(otp, existingOtp);
		if (!isOtpValid) {
			throw new Error('OTP is not correct');
		}

		return {
			success: true,
			message: 'OTP verified successfully.',
			data: { user: accInput, otpType },
		};
	}

	private async sendOtp(accInput: string, otp: string) {
		if (isEmail(accInput)) {
			await this.sendEmailOtp(accInput, otp);
		} else {
			await this.sendSmsOtp(accInput, otp);
		}
	}
	private generateOtp() {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}
	private async sendEmailOtp(email: string, otp: string): Promise<void> {
		try {
			// Dùng nodemailer để gửi
			const transporter = nodemailer.createTransport({
				host: process.env.MAIL_HOST || 'smtp.ethereal.email',
				port: parseInt(process.env.MAIL_PORT || '587'),
				secure: false,
				auth: {
					user: process.env.MAIL_USER,
					pass: process.env.MAIL_PASS,
				},
			});

			// Message object
			const message = {
				from: `SportA <${process.env.MAIL_USER}>`, // Sender address
				to: email,
				subject: 'Your One-Time Password (OTP)✔',
				text: 'Hello!',
				html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Your OTP Code</h2>
            <p>Please use the following code to complete your verification. This code is valid for 5 minutes.</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</p>
            <p>If you did not request this code, please ignore this email.</p>
          </div>
        `,
			};

			// Use Promise-based approach instead of callback
			const info = await transporter.sendMail(message);
			console.log('Email sent successfully. Message ID: %s', info.messageId);
		} catch (error) {
			console.error('Failed to send email:', error.message);
			throw new Error(`Failed to send OTP email: ${error.message}`);
		}
	}

	private async sendSmsOtp(phone: string, otp: string): Promise<void> {
		try {
			// TODO: Implement SMS sending using Twilio or Firebase
			// For now, just log the OTP (remove this in production)
			console.log(`SMS OTP for ${phone}: ${otp}`);

			// Uncomment and configure when SMS service is ready:
			// const twilioClient = require('twilio')(accountSid, authToken);
			// await twilioClient.messages.create({
			//   body: `Your OTP code is: ${otp}. Valid for 5 minutes.`,
			//   from: process.env.TWILIO_PHONE_NUMBER,
			//   to: phone
			// });

			throw new Error('SMS service not yet implemented. Please use email verification.');
		} catch (error) {
			console.error('Failed to send SMS:', error.message);
			throw new Error(`Failed to send OTP SMS: ${error.message}`);
		}
	}
	async deleteOtp(accInput: string, otp: string, otpType: string) {
		const key = `otp:${accInput}:${otpType}`;
		const existingOtp = await this.redisService.get(key);
		if (!existingOtp) {
			throw new Error('OTP not found. Please request a new OTP.');
		}
		const isOtpValid = await bcrypt.compare(otp, existingOtp);
		if (!isOtpValid) {
			throw new Error('OTP is not correct');
		}
		await this.redisService.del(key);
		return {
			success: true,
			message: 'OTP deleted successfully.',
		};
	}
	async checkOTPRateLimit(accInput: string, maxRequests: number = 3, windowMinutes: number = 5) {
		const key = `otp:rate-limit:${accInput}`;
		const windowSeconds = windowMinutes * 60;

		//get current count
		const currentCount = await this.redisService.get(key);
		if (!currentCount) {
			//first request - set counter with expiration
			await this.redisService.set(key, '1', windowSeconds);
			return { allowed: true };
		}
		const count = parseInt(currentCount);
		if (count < maxRequests) {
			//increment count
			await this.redisService.incr(key);
			return { allowed: true };
		}
		//exceed limit
		const ttl = await this.redisService.ttl(key);
		const resetTime = new Date(Date.now() + ttl * 1000);

		return {
			allowed: false,
			remainingTime: resetTime,
			message: 'Too many requests. Please try again later.',
		};
	}
}
