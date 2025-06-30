import { IsString, IsOptional } from 'class-validator';

export class AddressDto {
	@IsOptional()
	@IsString()
	country?: string;

	@IsOptional()
	@IsString()
	province?: string;

	@IsOptional()
	@IsString()
	district?: string;

	@IsOptional()
	@IsString()
	ward?: string;

	@IsOptional()
	@IsString()
	street?: string;
}
