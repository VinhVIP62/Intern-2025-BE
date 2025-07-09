import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class TokensDto {
	@ApiProperty({ example: 'access-token-jwt...' })
	@IsString()
	accessToken: string;

	@ApiPropertyOptional({ example: 'refresh-token-jwt...' })
	@IsString()
	refreshToken?: string;
}

export class ResponseEntityDto<T> {
	@ApiProperty({ example: true })
	@IsBoolean()
	success: boolean;

	@ApiProperty({
		example: { accessToken: 'access-token-jwt...', refreshToken: 'refresh-token-jwt...' },
	})
	data: T;
}
