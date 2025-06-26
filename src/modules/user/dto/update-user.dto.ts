import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Level } from '@common/enum';
import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Location, Sport } from '../entities/user.schema';

export class LocationDto implements Location {
	@Expose()
	@IsString()
	province: string;

	@Expose()
	@IsString()
	city: string;

	@Expose()
	@IsBoolean()
	@Transform(({ value }) => value === 'true')
	hidden: boolean;
}

export class SportDto implements Sport {
	@Expose()
	@IsEnum(Level)
	level: Level;

	@Expose()
	@IsString()
	name: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@Expose()
	@IsOptional()
	@Type(() => LocationDto)
	location: LocationDto;

	@Expose()
	@IsArray()
	@Type(() => SportDto)
	@ValidateNested()
	sports: SportDto[];
}
