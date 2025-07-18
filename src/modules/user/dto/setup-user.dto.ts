import { Expose, Transform, Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsDefined, IsNotEmpty, ValidateNested } from 'class-validator';
import { HasExtension, HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

import { LocationDto, SportDto } from './update-user.dto';

export class SetupUserDto {
	@Expose()
	@Type(() => MemoryStoredFile)
	@HasExtension(['png', 'jpg', 'jpeg', 'gif', 'webp'])
	@HasMimeType(['image/*'])
	@IsDefined()
	@IsFile()
	declare avatar: MemoryStoredFile;

	@Expose()
	@Type(() => LocationDto)
	@IsNotEmpty()
	@ValidateNested()
	declare location: LocationDto;

	@Expose()
	@Transform(({ value }) => {
		if (value === '[]') return [];
		return value as [];
	})
	@Type(() => SportDto)
	@IsArray()
	@ValidateNested({ each: true })
	@ArrayUnique((dto: SportDto) => dto.name, {
		message: "sport's names must be unique",
	})
	declare sports: SportDto[];
}
