import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class VerifyOtpDto {
	@ApiProperty({ description: 'Email của người dùng cần xác thực', example: 'abc@gmail.com' })
	@IsNotEmpty({ message: 'validation.auth.email.required' })
	@IsEmail({}, { message: 'validation.auth.email.invalid' })
	email: string;

	@ApiProperty({ description: 'Mã otp xác thực', example: '123456' })
	@Length(6, 6, { message: 'validation.auth.otp.invalid' })
	otp: string;
}
