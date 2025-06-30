import { Expose } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, IsStrongPassword } from 'class-validator';
import { MemoryStoredFile } from 'nestjs-form-data';

import { SetupUserDto } from './setup-user.dto';

export class SetupGoogleUserDto extends SetupUserDto {
	@Expose()
	@IsOptional()
	declare avatar: MemoryStoredFile;

	@Expose()
	@IsOptional()
	@IsString()
	username?: string;

	@Expose()
	@IsStrongPassword()
	password!: string;

	@Expose()
	@IsOptional()
	@IsEmail()
	mail?: string;

	@Expose()
	@IsPhoneNumber()
	phone!: string;
}
