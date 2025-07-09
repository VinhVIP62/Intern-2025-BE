import { Role } from '@common/enum/roles.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsBoolean,
	IsDateString,
	IsIn,
	IsNotEmpty,
	IsString,
	IsOptional,
	IsStrongPassword,
	IsUrl,
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

	@ApiPropertyOptional({
		description: 'Gender of the user',
		enum: ['male', 'female'],
		example: 'male',
	})
	@IsOptional()
	@IsIn(['male', 'female'], { message: 'Gender must be either male or female' })
	gender: string;

	@ApiProperty({ description: 'birthday user from external system', example: '2000-01-01' })
	@IsNotEmpty({ message: 'Birthday is required' })
	@IsDateString()
	birthday: Date;
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
	@ApiProperty({ description: 'email user from external system', example: '1234567' })
	@IsNotEmpty({ message: 'Email is required' })
	email: string;

	@ApiProperty({ description: 'full name user from external system', example: 'John Doe' })
	@IsNotEmpty({ message: 'Full name is required' })
	fullName: string;

	@ApiProperty({ description: 'User avatar url' })
	@IsOptional()
	@IsUrl()
	avatar?: string;

	@ApiProperty({ description: 'Verified user', default: true })
	@IsBoolean()
	verified: true;

	@ApiPropertyOptional({
		description: 'Gender of the user',
		enum: ['male', 'female'],
		example: 'male',
	})
	@IsOptional()
	@IsIn(['male', 'female'], { message: 'Gender must be either male or female' })
	gender: string;
}
