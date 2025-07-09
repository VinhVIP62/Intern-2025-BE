import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@Expose()
export class LoginDto {
	@ApiProperty({ description: 'Tên đăng nhập của người dùng', example: 'abc@gmail.com' })
	@IsNotEmpty({ message: 'validation.auth.email.required' })
	@IsEmail({}, { message: 'validation.auth.email.invalid' })
	email: string;

	@ApiProperty({ description: 'Mật khẩu của người dùng', example: 'StrongP@ssw0rd' })
	@IsNotEmpty({ message: 'validation.auth.password.required' })
	@IsString({ message: 'validation.auth.password.invalid' })
	password: string;
}
