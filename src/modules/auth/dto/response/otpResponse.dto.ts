import { ApiPropertyOptional } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsString } from 'class-validator';

export class OtpResponseDto {
	@IsString()
	@ApiPropertyOptional({ description: 'OTP code sent to the user' })
	message: string;
}
