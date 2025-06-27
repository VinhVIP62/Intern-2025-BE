import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseEmailDto {
	@ApiProperty({ description: 'ID của email đã gửi', example: 'abc123' })
	messageId: string;

	@ApiProperty({
		description: 'Danh sách email gửi thành công',
		type: [String],
		example: ['user@example.com'],
	})
	accepted: string[];

	@ApiProperty({ description: 'Danh sách email gửi thất bại', type: [String], example: [] })
	rejected: string[];

	@ApiPropertyOptional({ description: 'Mã OTP', example: '123456' })
	otp?: string;

	@ApiPropertyOptional({ description: 'Thời hạn OTP (UTC)', example: '2021-01-01T00:00:00.000Z' })
	otpExpired?: Date;

	@ApiPropertyOptional({
		description: 'Múi giờ được sử dụng (UTC cho en, GMT+7 cho vi)',
		example: 'UTC',
		enum: ['UTC', 'GMT+7'],
	})
	timezone?: string;

	@ApiPropertyOptional({
		description: 'Thời gian hết hạn được format theo ngôn ngữ và múi giờ địa phương',
		example: '01/01/2021, 12:00:00 AM',
		examples: {
			en: '01/01/2021, 12:00:00 AM',
			vi: '01/01/2021, 07:00:00',
		},
	})
	formattedExpiredTime?: string;
}
