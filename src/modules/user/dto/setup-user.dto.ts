import { Expose, Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsDefined, IsNotEmpty, ValidateNested } from 'class-validator';
import { HasExtension, HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

import { LocationDto, SportDto } from './update-user.dto';

export class SetupUserDto {
	@Expose()
	@Type(() => MemoryStoredFile)
	@HasExtension(['png', 'jpg', 'jpeg', 'gif'], { each: true })
	@HasMimeType(['image/png', 'image/jpeg', 'image/jpg', 'image/gif'], { each: true })
	@IsDefined()
	@IsFile()
	declare avatar: MemoryStoredFile;

	@Expose()
	@Type(() => LocationDto)
	@IsNotEmpty()
	@ValidateNested()
	declare location: LocationDto;

	@Expose()
	@Type(() => SportDto)
	@IsArray()
	@ValidateNested({ each: true })
	@ArrayUnique((dto: SportDto) => dto.name, {
		message: "sport's names must be unique",
	})
	declare sports: SportDto[];
}
