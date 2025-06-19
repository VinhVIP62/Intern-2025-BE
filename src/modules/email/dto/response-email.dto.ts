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

	otp?: string;
}
