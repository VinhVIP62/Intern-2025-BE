import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RequestOtpDto {
	@IsNotEmpty()
	@IsString()
	account: string;

	@IsNotEmpty()
	@IsString()
	otpType: string;
}

export class VerifyOtpDto {
	@IsNotEmpty()
	@IsString()
	account: string;

	@IsNotEmpty()
	@IsString()
	@Length(6, 6, { message: 'OTP must be 6 digits' })
	otp: string;

	@IsNotEmpty()
	@IsString()
	otpType: string;
}
