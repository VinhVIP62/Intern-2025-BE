import { ApiProperty } from '@nestjs/swagger';

export class OtpVerifiedDto {
	@ApiProperty({
		description: 'Token tạm thời được cấp sau khi xác thực OTP thành công',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	tempToken: string;
}
