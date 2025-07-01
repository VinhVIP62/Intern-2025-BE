import { OmitType } from '@nestjs/mapped-types';
import { Expose, Type } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, IsStrongPassword } from 'class-validator';
import { MemoryStoredFile } from 'nestjs-form-data';

import { SetupUserDto } from './setup-user.dto';

export class SetupGoogleUserDto extends OmitType(SetupUserDto, ['avatar']) {
	@Expose()
	@Type(() => MemoryStoredFile)
	@IsOptional()
	avatar?: MemoryStoredFile;

	@Expose()
	@IsOptional()
	@IsString()
	username?: string;

	@Expose()
	@IsStrongPassword()
	password!: string;

	@Expose()
	@IsEmail()
	@IsOptional()
	mail?: string;

	@Expose()
	@IsPhoneNumber()
	phone!: string;
}
