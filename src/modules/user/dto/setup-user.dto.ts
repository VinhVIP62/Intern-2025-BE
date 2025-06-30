import { Expose, Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { HasExtension, HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

import { LocationDto, SportDto } from './update-user.dto';

export class SetupUserDto {
	@Expose()
	@IsFile()
	@HasMimeType(['image/png', 'image/jpeg', 'image/jpg', 'image/gif'], { each: true })
	@HasExtension(['png', 'jpg', 'jpeg', 'gif'], { each: true })
	declare avatar: MemoryStoredFile;

	@Expose()
	@ValidateNested()
	@IsNotEmpty()
	@Type(() => LocationDto)
	declare location: LocationDto;

	@Expose()
	@IsArray()
	@ArrayUnique((dto: SportDto) => dto.name, {
		message: "sport's names must be unique",
	})
	@Type(() => SportDto)
	@ValidateNested({ each: true })
	declare sports: SportDto[];
}
