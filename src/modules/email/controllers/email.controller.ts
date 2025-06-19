import { Controller, Post, Body, Version } from '@nestjs/common';
import { EmailService } from '../providers/email.service';
import { SendEmailDto } from '../dto/send-email.dto';
import { ResponseEmailDto } from '../dto/response-email.dto';
import { ResponseEntity } from '@common/types';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { Public } from '@common/decorators';

@ApiTags('Email')
@Controller('email')
export class EmailController {
	constructor(private readonly emailService: EmailService) {}

	@Post('send-otp')
	@ApiOperation({ summary: 'Send OTP', description: 'Gửi mã OTP đến email người dùng' })
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
	async sendOTP(
		@Body('to') to: string,
	): Promise<ResponseEntity<ResponseEmailDto & { otp: string }>> {
		const result = await this.emailService.sendOTP(to);
		return {
			success: true,
			data: result,
		};
	}
}
