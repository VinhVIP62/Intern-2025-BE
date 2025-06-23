import { Role } from '@common/enum/roles.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsStrongPassword,
	MinLength,
} from 'class-validator';

export class CreateUserDto {
	@ApiProperty({
		description: 'Mật khẩu mạnh (tối thiểu 8 ký tự, 1 số, 1 chữ in hoa, 1 ký tự đặc biệt)',
		example: 'StrongP@ssw0rd',
	})
	@IsStrongPassword()
	@MinLength(8)
	password: string;
}

export class CreateUserByExternalDto {
	@ApiProperty({ description: 'ID user from external system', example: '1234567' })
	@IsNotEmpty({ message: 'External ID is required' })
	externalId: string;

	@ApiProperty({ description: 'Type of external system', example: 'GOOGLE' })
	@IsNotEmpty({ message: 'External type is required' })
	externalType: string;

	@ApiPropertyOptional({
		description: 'Danh sách role (ADMIN, MODERATOR, USER)',
		isArray: true,
		enum: Role,
	})
	@IsArray()
	@IsEnum(Role, { each: true })
	@IsOptional()
	roles?: Role[];
	@ApiProperty({ description: 'email user from external system', example: '1234567' })
	@IsNotEmpty({ message: 'Email is required' })
	email: string;
}
