import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform, Type } from 'class-transformer';
import {
	ArrayUnique,
	IsArray,
	IsBoolean,
	IsEnum,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { HasExtension, HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

import { Level } from '@common/enums';
import { str2bool } from '@common/utils';

import { Location, Sport } from '../entities';
import { CreateUserDto } from './create-user.dto';

export class LocationDto implements Location {
	@Expose()
	@IsString()
	province!: string;

	@Expose()
	@IsString()
	city!: string;

	@Expose()
	@IsBoolean()
	@Transform(({ value }) => (typeof value === 'string' ? str2bool(value) : (value as boolean)))
	hidden!: boolean;
}

export class SportDto implements Sport {
	@Expose()
	@IsEnum(Level)
	level!: Level;

	@Expose()
	@IsString()
	name!: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@Expose()
	@IsOptional()
	@IsFile()
	@HasMimeType(['image/png', 'image/jpeg', 'image/jpg', 'image/gif'], { each: true })
	@HasExtension(['png', 'jpg', 'jpeg', 'gif'], { each: true })
	avatar?: MemoryStoredFile;

	@Expose()
	@IsOptional()
	@ValidateNested()
	@Type(() => LocationDto)
	location?: LocationDto;

	@Expose()
	@IsOptional()
	@IsArray()
	@ArrayUnique((dto: SportDto) => dto.name, {
		message: "sport's names must be unique",
	})
	@Type(() => SportDto)
	@ValidateNested({ each: true })
	sports?: SportDto[];
}
