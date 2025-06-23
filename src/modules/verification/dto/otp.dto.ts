import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RequestOtpDto {
	@IsNotEmpty()
	@IsString()
	accInput: string;
}

export class VerifyOtpDto {
	@IsNotEmpty()
	@IsString()
	accInput: string;

	@IsNotEmpty()
	@IsString()
	@Length(6, 6, { message: 'OTP must be 6 digits' })
	otp: string;
}
