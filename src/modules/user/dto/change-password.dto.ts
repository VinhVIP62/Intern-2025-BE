import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
	@IsStrongPassword()
	@ApiProperty({ description: 'New password' })
	newPassword: string;
}
