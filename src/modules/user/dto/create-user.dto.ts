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
	@ApiProperty({ description: 'Email của người dùng', example: 'johndoe@example.com' })
	@IsNotEmpty({ message: 'Email is required' })
	@IsEmail()
	email: string;

	@ApiProperty({
		description: 'Mật khẩu mạnh (tối thiểu 8 ký tự, 1 số, 1 chữ in hoa, 1 ký tự đặc biệt)',
		example: 'StrongP@ssw0rd',
	})
	@IsStrongPassword()
	password: string;

	@ApiPropertyOptional({
		description: 'Danh sách role (ADMIN, MODERATOR, USER)',
		isArray: true,
		enum: Role,
	})
	@IsArray()
	@IsEnum(Role, { each: true })
	@IsOptional()
	roles?: Role[];
}
