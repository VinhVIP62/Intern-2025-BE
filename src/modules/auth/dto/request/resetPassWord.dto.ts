import { IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
	@ApiProperty({
		description: 'Mật khẩu mạnh (tối thiểu 8 ký tự, 1 số, 1 chữ in hoa, 1 ký tự đặc biệt)',
		example: 'StrongP@ssw0rd',
	})
	@IsStrongPassword()
	newPassword: string;

	@IsString()
	@ApiProperty({
		description: 'Token to be used for reset password',
		example: 'hashed-reset-password-token',
	})
	resetPasswordToken: string;
}
