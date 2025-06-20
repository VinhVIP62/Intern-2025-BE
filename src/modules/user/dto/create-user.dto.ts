import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
	@IsNotEmpty({ message: 'Username is required' })
	username: string;

	@IsStrongPassword()
	password: string;
}
