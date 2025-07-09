import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {
	@ApiProperty({
		description:
			'Mật khẩu mới mạnh (tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số, ký tự đặc biệt)',
		example: 'NewP@ssw0rd',
	})
	@IsNotEmpty({ message: 'validation.user.newPassword.required' })
	@IsStrongPassword({}, { message: 'validation.user.newPassword.weak' })
	newPassword: string;
}
