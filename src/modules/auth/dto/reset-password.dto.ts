import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

@Expose()
export class ResetPasswordDto {
	@ApiProperty({ description: 'Tên đăng nhập của người dùng' })
	@IsString()
	account: string;

	@ApiProperty({ description: 'Mật khẩu của người dùng' })
	@IsString()
	@IsStrongPassword()
	newPassword: string;

	@ApiProperty({ description: 'OTP của người dùng' })
	@IsString()
	otp: string;

	@ApiProperty({ description: 'OTP type', example: 'reset-password' })
	@IsNotEmpty({ message: 'OTP type is required' })
	otpType?: string;
}
