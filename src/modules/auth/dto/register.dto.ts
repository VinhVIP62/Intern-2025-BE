import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
export class RegisterDto extends CreateUserDto {
	@ApiProperty({ description: 'Phone number or email', example: '0123456789 or abc@gmail.com' })
	@IsNotEmpty({ message: 'Phone number or email is required' })
	account: string;

	@ApiProperty({ description: 'Full name', example: 'John Doe' })
	@IsNotEmpty({ message: 'Full name is required' })
	fullName: string;

	@ApiProperty({ description: 'OTP', example: '123456' })
	@IsNotEmpty({ message: 'OTP is required' })
	otp: string;

	@ApiProperty({ description: 'OTP type', example: 'register' })
	@IsNotEmpty({ message: 'OTP type is required' })
	otpType: string;

	@ApiProperty({ description: 'Avatar', example: 'https://example.com/avatar.jpg' })
	@IsOptional()
	avatar?: string;
}
