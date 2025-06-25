import { ApiPropertyOptional } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsString } from 'class-validator';

export class VerifyOtpResponseDto {
	@IsString()
	@ApiPropertyOptional({ description: 'Message indicating the result of the OTP verification' })
	message: string;

	@ApiPropertyOptional({ description: 'Indicates whether the OTP verification was successful' })
	isValid: boolean;

	@ApiPropertyOptional({ description: 'Token to be used for reset password' })
	resetPasswordToken?: string;
}
