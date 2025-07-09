import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
	@ApiProperty({ description: 'Mật khẩu cũ', example: 'OldP@ss123' })
	@IsNotEmpty({ message: 'validation.user.oldPassword.required' })
	@IsString({ message: 'validation.user.oldPassword.string' })
	oldPassword: string;

	@ApiProperty({
		description:
			'Mật khẩu mới mạnh (tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số, ký tự đặc biệt)',
		example: 'NewP@ssw0rd',
	})
	@IsNotEmpty({ message: 'validation.user.newPassword.required' })
	@IsStrongPassword({}, { message: 'validation.user.newPassword.weak' })
	newPassword: string;
}
