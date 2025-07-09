// register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class RegisterDto {
	@ApiProperty({ description: 'Mật khẩu mạnh', example: 'StrongP@ssw0rd' })
	@IsNotEmpty({ message: 'validation.user.password.required' })
	@IsStrongPassword({}, { message: 'validation.user.password.weak' })
	password: string;
}
