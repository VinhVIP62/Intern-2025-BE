import { Controller, Post, Body, Version } from '@nestjs/common';
import { EmailService } from '../providers/email.service';
import { SendEmailDto } from '../dto/send-email.dto';
import { ResponseEmailDto } from '../dto/response-email.dto';
import { ResponseEntity } from '@common/types';
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiHeader } from '@nestjs/swagger';
import { Public } from '@common/decorators';

@ApiTags('Email')
@Controller('email')
export class EmailController {
	constructor(private readonly emailService: EmailService) {}

	@Post('send-otp')
	@ApiOperation({ summary: 'Send OTP', description: 'Gửi mã OTP đến email người dùng' })
	@ApiHeader({
		name: 'accept-language',
		description: 'Ngôn ngữ (en hoặc vi) - Có thể dùng header này hoặc query parameter ?lang=en',
		example: 'en',
		required: false,
	})
	@ApiBody({
		schema: {
			properties: {
				to: { type: 'string', example: 'user@example.com', description: 'Email nhận OTP' },
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'OTP đã được gửi thành công',
		type: ResponseEmailDto,
	})
	@Public()
	@Version('1')
	async sendOTP(@Body('to') to: string): Promise<ResponseEntity<ResponseEmailDto>> {
		const result = await this.emailService.sendOTP(to);
		return {
			success: true,
			data: result,
		};
	}

	@Post('verify-otp')
	@ApiOperation({ summary: 'Verify OTP', description: 'Xác thực OTP' })
	@ApiHeader({
		name: 'accept-language',
		description: 'Ngôn ngữ (en hoặc vi) - Có thể dùng header này hoặc query parameter ?lang=en',
		example: 'en',
		required: false,
	})
	@ApiBody({
		schema: {
			properties: {
				email: { type: 'string', example: 'user@example.com', description: 'Email nhận OTP' },
				otp: { type: 'string', example: '123456', description: 'OTP' },
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'OTP đã được xác thực thành công',
		type: ResponseEmailDto,
	})
	@Public()
	@Version('1')
	async verifyOtp(
		@Body('email') email: string,
		@Body('otp') otp: string,
	): Promise<ResponseEntity<boolean>> {
		const result = await this.emailService.verifyOtp(email, otp);
		return { success: true, data: result };
	}
}
