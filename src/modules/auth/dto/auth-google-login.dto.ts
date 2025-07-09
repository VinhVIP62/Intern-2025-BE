import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthGoogleLoginDto {
	@ApiProperty({ description: 'Google access token', example: '1234567890' })
	@IsNotEmpty()
	accessToken: string;
}
