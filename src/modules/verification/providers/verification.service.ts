import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmail } from 'validator';
import { Otp } from '../entities/otp.schema';
import { Model } from 'mongoose';
import { TokenService } from '../../auth/providers/token.service';
import * as nodemailer from 'nodemailer';

import { UserService } from '@modules/user/providers/user.service';

@Injectable()
export class verificationService {
	constructor(
		@InjectModel(Otp.name) private otpModel: Model<Otp>,
		private readonly tokenService: TokenService,
		private readonly userService: UserService, // **IMPORTANT**: Inject UserService
	) {}
	//send otp to user, check exist mail or phonenumber
	async requestOtp(accInput: string) {
		const existingOtp = await this.otpModel.findOne({ accInput });

		if (existingOtp && existingOtp.expiredAt > new Date()) {
			// If a valid OTP exists, resend it
			await this.sendOtp(accInput, existingOtp.otp);
			return 'Active OTP has been re-sent.';
		}

		// 2. If no active OTP, create a new one
		const otp = this.generateOtp();
		const expiredAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

		// 3. Use findOneAndUpdate with `upsert` to create or update in one DB call
		await this.otpModel.findOneAndUpdate(
			{ accInput },
			{ accInput, otp, expiredAt },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);

		// 4. Send the newly created OTP
		await this.sendOtp(accInput, otp);

		return 'A new OTP has been sent successfully.';
	}
	//create user if not exists
	async otpVerify(accInput: string, otp: string) {
		const existingOtp = await this.otpModel.findOne({ accInput });
		if (!existingOtp) {
			throw new Error('OTP not found. Please request a new OTP.');
		}
		if (existingOtp.otp !== otp) {
			throw new Error('OTP is not correct');
		}
		if (existingOtp.expiredAt < new Date(Date.now())) {
			throw new Error('OTP is expired.  Please request a new OTP.');
		}
		// Xóa OTP sau khi xác thực thành công
		// --- CRITICAL LOGIC ---
		// The token should be for a USER, not an OTP document.
		// We find or create a user associated with the email/phone.

		const user = await this.userService.findByEmailOrNumber(accInput);

		//send success email or sms will do next
		if (!user) {
			throw new Error('User not found. Please register first.');
		}
		// Now, generate tokens for the ACTUAL user
		const tokens = await this.tokenService.generateTokens({
			// The `sub` (subject) of the token MUST be the user's unique ID
			sub: {
				id: user._id, // Or whatever properties you need
				roles: user.roles,
			},
		});

		// // Delete the OTP from the database after successful verification
		// await this.otpModel.deleteOne({ _id: existingOtp._id });
		console.log({
			success: true,
			message: 'OTP verified successfully.',
			data: { user, tokens },
		});
		return {
			success: true,
			message: 'OTP verified successfully.',
			data: { user, tokens },
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
	private async sendEmailOtp(email: string, otp: string) {
		// Dùng nodemailer  để gửi
		const transporter = nodemailer.createTransport({
			host: process.env.MAIL_HOST || 'smtp.ethereal.email',
			port: process.env.MAIL_PORT || 587,
			secure: false,
			auth: {
				user: process.env.MAIL_USER,
				pass: process.env.MAIL_PASS,
			},
		});
		// Message object
		let message = {
			from: `Sender <${process.env.MAIL_USER}>`, // Sender address
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

		transporter.sendMail(message, (err: any, info: any) => {
			if (err) {
				console.log('Error occurred. ' + err.message);
				return process.exit(1);
			}

			console.log('Message sent: %s', info.messageId);
		});
	}

	private async sendSmsOtp(phone: string, otp: string) {
		// Dùng Twilio hoặc Firebase để gửi SMS
	}
}
