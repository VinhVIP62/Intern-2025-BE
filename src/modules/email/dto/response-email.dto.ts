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

	@ApiPropertyOptional({ description: 'Thời hạn OTP', example: '2021-01-01T00:00:00.000Z' })
	otpExpired?: Date;
}
