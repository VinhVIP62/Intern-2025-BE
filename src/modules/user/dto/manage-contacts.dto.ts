import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class AddContactDto {
	@ApiProperty({ description: 'Email to add', example: 'new@example.com' })
	@IsEmail()
	@IsNotEmpty()
	contact: string;
	@ApiProperty({ description: 'OTP to add email', example: '123456' })
	@IsNotEmpty()
	otp: string;
	@ApiProperty({ description: 'OTP type', example: 'add-email' })
	@IsNotEmpty()
	otpType: string;
}

export class RemoveContactDto {
	@ApiProperty({ description: 'Contact to remove', example: 'old@example.com' })
	@IsEmail()
	@IsNotEmpty()
	contact: string;

	@ApiProperty({ description: 'Password', example: 'StrongP@ssWord' })
	@IsNotEmpty()
	password: string;
}
