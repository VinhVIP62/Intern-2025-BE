import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { IOtpRepository } from '../repositories/otp.repository';

@Injectable()
export class OtpService {
	constructor(private readonly otpRepository: IOtpRepository) {}

	async createOtp(email: string, otp: string) {
		// Xóa OTP cũ nếu có
		await this.otpRepository.deleteByEmail(email);
		// Lưu OTP vào database
		await this.otpRepository.create(email, otp);
	}

	async verifyOtp(email: string) {
		// Tìm OTP trong database
		const otpRecord = await this.otpRepository.findByEmail(email);

		if (!otpRecord) {
			throw new NotFoundException('Invalid OTP or email');
		}

		// Kiểm tra OTP có hết hạn chưa
		if (!otpRecord.isValid()) {
			// Xóa OTP đã hết hạn
			await this.otpRepository.deleteById(otpRecord._id as string);
			throw new BadRequestException('OTP has expired');
		}

		// Xóa OTP sau khi xác thực thành công
		await this.otpRepository.deleteById(otpRecord._id as string);
	}
}
