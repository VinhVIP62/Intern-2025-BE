import { IsOptional, IsString } from 'class-validator';

export class ResponseAuthDto {
	@IsString()
	@IsOptional()
	accessToken?: string;

	@IsString()
	@IsOptional()
	refreshToken?: string;
}
