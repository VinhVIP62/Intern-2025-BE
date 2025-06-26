import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Level } from '@common/enum';
import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Location, Sport } from '../entities/user.schema';
import { str2bool } from '@common/utils';

export class LocationDto implements Location {
	@Expose()
	@IsString()
	province: string;

	@Expose()
	@IsString()
	city: string;

	@Expose()
	@IsBoolean()
	@Transform(({ value }) => (typeof value === 'string' ? str2bool(value) : (value as boolean)))
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
	@ValidateNested()
	@Type(() => LocationDto)
	location: LocationDto;

	@Expose()
	@IsOptional()
	@IsArray()
	@Type(() => SportDto)
	@ValidateNested({ each: true })
	sports: SportDto[];
}
