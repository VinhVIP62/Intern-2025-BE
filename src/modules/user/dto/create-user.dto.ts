import { Role } from '@common/enum/roles.enum';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
	@IsNotEmpty({ message: 'Username is required' })
	username: string;

	@IsStrongPassword()
	password: string;

	@IsArray()
	@IsEnum(Role, { each: true })
	@IsOptional()
	roles?: Role[];
}
