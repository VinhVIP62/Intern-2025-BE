import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from '../dto/send-email.dto';
import { ResponseEmailDto } from '../dto/response-email.dto';
import { IEnvVars } from '@configs/config';
import { randomInt } from 'crypto';
import { OtpService } from '@modules/otp/providers/otp.service';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class EmailService {
	private transporter: nodemailer.Transporter;
	private from: string;

	constructor(
		private readonly configService: ConfigService<IEnvVars>,
		private readonly otpService: OtpService,
	) {
		const emailConfig = this.configService.get('email', { infer: true });
		if (!emailConfig) {
			throw new Error('Email configuration is missing in environment variables');
		}
		this.transporter = nodemailer.createTransport({
			host: emailConfig.host,
			port: emailConfig.port,
			secure: emailConfig.secure,
			auth: {
				user: emailConfig.user,
				pass: emailConfig.pass,
			},
		});
		this.from = emailConfig.from;
	}

	// Lấy cấu hình múi giờ và locale theo ngôn ngữ
	private getLocaleConfig(lang: string) {
		const isVietnamese = lang === 'vi';
		return {
			locale: isVietnamese ? 'vi-VN' : 'en-US',
			timeZone: isVietnamese ? 'Asia/Ho_Chi_Minh' : 'UTC',
		};
	}

	// Format thời gian theo ngôn ngữ và múi giờ
	private formatDateTime(date: Date, lang: string): string {
		const { locale, timeZone } = this.getLocaleConfig(lang);
		return date.toLocaleString(locale, {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
	}

	// Tạo thời gian hết hạn OTP
	private createOtpExpiredTime(): Date {
		return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
	}

	async sendMail(data: SendEmailDto): Promise<ResponseEmailDto> {
		const info = await this.transporter.sendMail({
			from: this.from,
			to: data.to,
			subject: data.subject,
			text: data.text,
			html: data.html,
		});

		return {
			messageId: info.messageId,
			accepted: info.accepted.filter((item): item is string => typeof item === 'string'),
			rejected: info.rejected.filter((item): item is string => typeof item === 'string'),
		};
	}

	async sendOTP(to: string, i18n?: I18nContext): Promise<ResponseEmailDto> {
		const otp = randomInt(100000, 1000000).toString();
		const otpExpired = this.createOtpExpiredTime();

		// Get current language context
		const lang = i18n?.lang || I18nContext.current()?.lang || 'en';

		// Format time based on language
		const timeZone = i18n ? i18n.t('email.TIME_ZONE') : 'UTC';
		const expiresInText =
			i18n ?
				i18n.t('email.OTP_EXPIRES_IN', { args: { minutes: 5 } })
			:	'This code will expire in 5 minutes';
		const expiresAtText =
			i18n ?
				i18n.t('email.OTP_EXPIRES_AT', { args: { time: this.formatDateTime(otpExpired, lang) } })
			:	`This code will expire at ${this.formatDateTime(otpExpired, lang)}`;

		// Get email content from i18n
		const subject = i18n ? i18n.t('email.EMAIL_SUBJECT') : '[ALOBO Sport Hub] Verification Code';
		const greeting = i18n ? i18n.t('email.EMAIL_GREETING') : 'Hello,';
		const verificationCodeText =
			i18n ? i18n.t('email.EMAIL_VERIFICATION_CODE') : 'Your verification code is:';
		const ignoreMessage =
			i18n ?
				i18n.t('email.EMAIL_IGNORE_MESSAGE')
			:	"If you didn't request this code, please ignore this email.";

		const text = `${subject}\n\n${greeting}\n\n${verificationCodeText}\n\n${otp}\n\n${expiresInText}.\n\n${ignoreMessage}`;
		const html = `
			<div style=\"font-family: Arial, sans-serif; color: #222;\">
				<h2>${subject}</h2>
				<p>${greeting}</p>
				<p>${verificationCodeText}</p>
				<p style=\"font-size: 22px; font-weight: bold; color: #1976d2; letter-spacing: 2px;\">${otp}</p>
				<p>${expiresInText}.</p>
				<p><strong>${expiresAtText}</strong></p>
				<br />
				<p style=\"color: #888; font-size: 14px;\">${ignoreMessage}</p>
			</div>
		`;
		const result = await this.sendMail({ to, subject, text, html });

		// save otp to db
		await this.otpService.createOtp(to, otp);

		const formattedExpiredTime = this.formatDateTime(otpExpired, lang);

		return {
			...result,
			otpExpired,
			timezone: timeZone,
			formattedExpiredTime,
		};
	}

	async verifyOtp(
		email: string,
		otp: string,
		i18n?: I18nContext,
	): Promise<{ isValid: boolean; message?: string }> {
		const isValid = await this.otpService.verifyOtp(email, otp);

		if (!isValid && i18n) {
			const message = i18n.t('email.OTP_VERIFICATION_FAILED');
			return { isValid, message };
		}

		return { isValid };
	}
}
