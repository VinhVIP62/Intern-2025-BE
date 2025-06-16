import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	username: string;

	@IsNotEmpty()
	@IsString()
	password: string;

	@IsNotEmpty()
	@IsString()
	fullName: string;
}
