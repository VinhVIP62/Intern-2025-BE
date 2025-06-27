import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { IOtpRepository } from '../repositories/otp.repository';
import { I18nService, I18nContext } from 'nestjs-i18n';

@Injectable()
export class OtpService {
	constructor(
		private readonly otpRepository: IOtpRepository,
		private readonly i18n: I18nService,
	) {}

	async createOtp(email: string, otp: string) {
		// Xóa OTP cũ nếu có
		await this.otpRepository.deleteByEmail(email);
		// Lưu OTP vào database
		await this.otpRepository.create(email, otp);
	}

	async verifyOtp(email: string, otp: string): Promise<boolean> {
		// Get current language context
		const lang = I18nContext.current()?.lang || 'en';

		// Tìm OTP trong database
		const otpRecord = await this.otpRepository.findByEmail(email);
		if (!otpRecord) {
			const message = await this.i18n.translate('common.OTP_INVALID_OR_EMAIL', { lang });
			throw new NotFoundException(message);
		}

		// Kiểm tra OTP có hết hạn chưa
		if (!otpRecord.isValid()) {
			// Xóa OTP đã hết hạn
			await this.otpRepository.deleteById(otpRecord._id as string);
			const message = await this.i18n.translate('common.OTP_EXPIRED', { lang });
			throw new BadRequestException(message);
		}

		if (otpRecord.otp !== otp) {
			const message = await this.i18n.translate('common.OTP_INVALID', { lang });
			throw new BadRequestException(message);
		}

		// Xóa OTP sau khi xác thực thành công
		await this.otpRepository.deleteById(otpRecord._id as string);

		return true;
	}
}
