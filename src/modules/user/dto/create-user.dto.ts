import { Role } from '@common/enum/roles.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsArray,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
	@ApiProperty({ description: 'Tên đăng nhập', example: 'johndoe@gmail.com' })
	@IsNotEmpty({ message: 'validation.user.email.required' })
	@IsEmail({}, { message: 'validation.user.email.invalid' })
	email: string;

	@ApiProperty({
		description:
			'Mật khẩu mạnh (tối thiểu 8 ký tự phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt)',
		example: 'StrongP@ssw0rd',
	})
	@IsNotEmpty({ message: 'validation.user.password.required' })
	@IsStrongPassword({}, { message: 'validation.user.password.weak' })
	password: string;

	@ApiPropertyOptional({
		description: 'Danh sách role (ADMIN, MODERATOR, USER)',
		isArray: true,
		enum: Role,
	})
	@IsOptional()
	@IsArray({ message: 'validation.user.roles.notArray' })
	@IsEnum(Role, { each: true, message: 'validation.user.roles.invalidEnum' })
	roles?: Role[];
}
