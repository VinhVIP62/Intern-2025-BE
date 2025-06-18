import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Expose()
export class LoginDto {
	@IsString()
	username: string;

	@IsString()
	password: string;
}
