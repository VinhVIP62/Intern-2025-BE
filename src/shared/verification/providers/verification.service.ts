import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmail } from 'validator';
import { Otp } from '../entities/otp.schema';
import { Model } from 'mongoose';
import { TokenService } from '../../../modules/auth/providers/token.service';
import * as nodemailer from 'nodemailer';

import { UserService } from '@modules/user/providers/user.service';
import * as bcrypt from 'bcrypt';
import { OTPType } from '@common/enum/otp.enum';

@Injectable()
export class verificationService {
	constructor(
		@InjectModel(Otp.name) private otpModel: Model<Otp>,
		private readonly tokenService: TokenService,
		private readonly userService: UserService, // **IMPORTANT**: Inject UserService
	) {}
	//send otp to user, check exist mail or phonenumber
	async requestOtp(accInput: string, otpType: string) {
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

		// Sinh OTP và lưu vào DB
		const otp = this.generateOtp();
		const hashedOtp = await bcrypt.hash(otp, 10);
		const expiredAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
		await this.otpModel.findOneAndUpdate(
			{ accInput },
			{ accInput, otp: hashedOtp, expiredAt, otpType },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);

		// Gửi OTP (mail/sms)
		await this.sendOtp(accInput, otp);

		return 'A new OTP has been sent successfully.';
	}
	//create user if not exists
	async otpVerify(accInput: string, otp: string, otpType: string) {
		const existingOtp = await this.otpModel.findOne({ accInput });
		if (!existingOtp) {
			throw new Error('OTP not found. Please request a new OTP.');
		}
		const isOtpValid = await bcrypt.compare(otp, existingOtp.otp);
		if (!isOtpValid) {
			throw new Error('OTP is not correct');
		}
		if (existingOtp.expiredAt < new Date(Date.now())) {
			throw new Error('OTP is expired.  Please request a new OTP.');
		}
		if (otpType !== existingOtp.otpType) {
			throw new Error('OTP type is not correct');
		}
		// Delete the OTP from the database after successful verification
		// await this.otpModel.deleteOne({ _id: existingOtp._id });

		return {
			success: true,
			message: 'OTP verified successfully.',
			data: { user: existingOtp.accInput, otpType },
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
		const existingOtp = await this.otpModel.findOne({ accInput });
		if (!existingOtp) {
			throw new Error('OTP not found. Please request a new OTP.');
		}
		await this.otpModel.deleteOne({ _id: existingOtp._id });
		return {
			success: true,
			message: 'OTP deleted successfully.',
		};
	}
}
