import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from '../dto/send-email.dto';
import { ResponseEmailDto } from '../dto/response-email.dto';
import { IEnvVars } from '@configs/config';
import { randomInt } from 'crypto';
import { OtpService } from '@modules/otp/providers/otp.service';
import { I18nService, I18nContext } from 'nestjs-i18n';

@Injectable()
export class EmailService {
	private transporter: nodemailer.Transporter;
	private from: string;

	constructor(
		private readonly configService: ConfigService<IEnvVars>,
		private readonly otpService: OtpService,
		private readonly i18n: I18nService,
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

	async sendOTP(to: string): Promise<ResponseEmailDto> {
		const otp = randomInt(100000, 1000000).toString();
		const otpExpired = this.createOtpExpiredTime();

		// Get current language context
		const lang = I18nContext.current()?.lang || 'en';

		// Format time based on language
		const timeZone = await this.i18n.translate('common.TIME_ZONE', { lang });
		const expiresInText = await this.i18n.translate('common.OTP_EXPIRES_IN', {
			lang,
			args: { minutes: 5 },
		});
		const expiresAtText = await this.i18n.translate('common.OTP_EXPIRES_AT', {
			lang,
			args: {
				time: this.formatDateTime(otpExpired, lang),
			},
		});

		// Get email content from i18n
		const subject = await this.i18n.translate('common.EMAIL_SUBJECT', { lang });
		const greeting = await this.i18n.translate('common.EMAIL_GREETING', { lang });
		const verificationCodeText = await this.i18n.translate('common.EMAIL_VERIFICATION_CODE', {
			lang,
		});
		const ignoreMessage = await this.i18n.translate('common.EMAIL_IGNORE_MESSAGE', { lang });

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

	async verifyOtp(email: string, otp: string): Promise<boolean> {
		const isValid = await this.otpService.verifyOtp(email, otp);
		return isValid;
	}
}
