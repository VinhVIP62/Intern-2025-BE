import { IsString, IsOptional, IsDateString, IsEnum, IsArray } from 'class-validator';
import { Sports } from '@common/enum/sports.enum';
import { SportLevel } from '@common/enum/sport-level.enum';
import { ApiPropertyOptional } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { AddressDto } from './address.dto';

export class ProfileResponseDto {
	@ApiPropertyOptional({ description: 'Thông điệp trả về' })
	@IsString()
	message: string;

	@IsString()
	firstName: string;

	@IsString()
	lastName: string;

	@IsOptional()
	@IsString()
	bio?: string | null;

	@IsOptional()
	@IsString()
	avatarUrl?: string | null;

	@IsOptional()
	@IsString()
	coverUrl?: string | null;

	@IsDateString()
	birthday: string;

	@IsString()
	gender: string;

	@IsOptional()
	address?: AddressDto;

	@IsArray()
	@IsEnum(Sports, { each: true })
	sportInterests: Sports[];

	@IsArray()
	@IsEnum(SportLevel, { each: true })
	sportLevel: SportLevel[];
}
