import { IsEmailOrPhone } from '@common/validator';
import { Expose } from 'class-transformer';
import { IsString, Validate } from 'class-validator';

export class LoginDto {
	@Expose()
	@IsString()
	@Validate(IsEmailOrPhone)
	id: string;

	@Expose()
	@IsString()
	password: string;
}
