import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
export class UpdateUserDto {
	@ApiProperty({ description: 'User full name' })
	@IsOptional()
	@IsString()
	fullName?: string;

	@ApiProperty({ description: 'User gender' })
	@IsOptional()
	@IsString()
	gender?: string;

	@ApiProperty({ description: 'User birthday' })
	@IsOptional()
	@IsDateString()
	birthday?: Date;

	@ApiProperty({ description: 'User address' })
	@IsOptional()
	@IsString()
	address?: string;

	@ApiProperty({ description: 'User description' })
	@IsOptional()
	@IsString()
	description?: string;
}
