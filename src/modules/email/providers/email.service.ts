import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from '../dto/send-email.dto';
import { ResponseEmailDto } from '../dto/response-email.dto';
import { IEnvVars } from '@configs/config';
import { randomInt } from 'crypto';

@Injectable()
export class EmailService {
	private transporter: nodemailer.Transporter;
	private from: string;

	constructor(private readonly configService: ConfigService<IEnvVars>) {
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
		const otpExpired = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

		const subject = '[ALOBO Sport Hub] Verification Code';
		const text = `Verification Code\n\nHello,\n\nYour verification code is:\n\n${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`;
		const html = `
			<div style=\"font-family: Arial, sans-serif; color: #222;\">
				<h2>Verification Code</h2>
				<p>Hello,</p>
				<p>Your verification code is:</p>
				<p style=\"font-size: 22px; font-weight: bold; color: #1976d2; letter-spacing: 2px;\">${otp}</p>
				<p>This code will expire in 5 minutes.</p>
				<br />
				<p style=\"color: #888; font-size: 14px;\">If you didn't request this code, please ignore this email.</p>
			</div>
		`;
		const result = await this.sendMail({ to, subject, text, html });
		return { ...result, otp, otpExpired };
	}
}
