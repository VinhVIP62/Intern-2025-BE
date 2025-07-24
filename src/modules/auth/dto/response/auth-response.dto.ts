import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ResponseAuthDto {
	@ApiPropertyOptional({ description: 'Access token trả về sau khi đăng nhập hoặc refresh' })
	@IsString()
	@IsOptional()
	accessToken?: string;

	@ApiPropertyOptional({ description: 'Refresh token đi kèm với access token' })
	@IsString()
	@IsOptional()
	refreshToken?: string;
}
