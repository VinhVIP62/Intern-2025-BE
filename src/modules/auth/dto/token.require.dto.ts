import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenRequireDto {
	@ApiPropertyOptional({ description: 'Access token trả về sau khi đăng nhập hoặc refresh' })
	@IsString()
	accessToken: string;

	@ApiPropertyOptional({ description: 'Refresh token đi kèm với access token' })
	@IsString()
	refreshToken: string;
}
