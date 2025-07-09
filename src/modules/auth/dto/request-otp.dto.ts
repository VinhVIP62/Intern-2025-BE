import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestOtpDto {
	@ApiProperty({ description: 'Email của người dùng cần xác thực', example: 'abc@gmail.com' })
	@IsNotEmpty({ message: 'validation.auth.email.required' })
	@IsEmail({}, { message: 'validation.auth.email.invalid' })
	email: string;
}
