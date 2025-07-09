import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
	private transporter: Transporter;

	constructor(private configService: ConfigService) {
		this.transporter = nodemailer.createTransport({
			host: this.configService.get<string>('MAIL_HOST'),
			port: this.configService.get<number>('MAIL_PORT'),
			secure: false,
			auth: {
				user: this.configService.get<string>('MAIL_USER'),
				pass: this.configService.get<string>('MAIL_PASS'),
			},
		}) as unknown as Transporter;
	}

	async sendOTP(to: string, otp: string, type: 'verify' | 'reset') {
		const isVerify = type === 'verify';
		const subject =
			isVerify ? 'Xác thực tài khoản Social Sport của bạn' : 'Đặt lại mật khẩu Social Sport';

		const headerText = isVerify ? 'Mã xác thực OTP của bạn' : 'Mã OTP để đặt lại mật khẩu';

		const bodyText =
			isVerify ?
				'Chúng tôi đã nhận được yêu cầu xác thực từ bạn.'
			:	'Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu từ bạn.';

		const actionText =
			isVerify ?
				'Hãy sử dụng mã OTP bên dưới để xác thực tài khoản:'
			:	'Hãy sử dụng mã OTP bên dưới để đặt lại mật khẩu:';

		await this.transporter.sendMail({
			from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get('MAIL_FROM_EMAIL')}>`,
			to,
			subject,
			html: `
		<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
			<div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
				<div style="background-color: #28a745; padding: 20px; color: white; text-align: center;">
					<h1 style="margin: 0;">Social Sport</h1>
					<p style="margin: 0;">${headerText}</p>
				</div>
				<div style="padding: 30px; text-align: center;">
					<p style="font-size: 16px;">Xin chào,</p>
					<p>${bodyText}</p>
					<p>${actionText}</p>
					<div style="font-size: 28px; font-weight: bold; color: #28a745; margin: 20px 0;">${otp}</div>
					<p style="font-size: 14px; color: #555;">Mã OTP có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ với bất kỳ ai.</p>
				</div>
				<div style="background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
					&copy; ${new Date().getFullYear()} Social Sport. All rights reserved.
				</div>
			</div>
		</div>
		`,
		});
	}
}
