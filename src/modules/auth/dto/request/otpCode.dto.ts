import { IsString } from 'class-validator';
import { IsEmail } from 'class-validator';

export class OtpCodeDto {
	@IsString()
	otp: string;

	@IsEmail()
	email: string;
}
