import { Expose, Type } from 'class-transformer';
import { ArrayUnique, IsArray, ValidateNested } from 'class-validator';
import { LocationDto, SportDto } from './update-user.dto';

export class SetupUserDto {
	@Expose()
	@ValidateNested()
	@Type(() => LocationDto)
	location: LocationDto;

	@Expose()
	@IsArray()
	@ArrayUnique((dto: SportDto) => dto.name, {
		message: "sport's names must be unique",
	})
	@Type(() => SportDto)
	@ValidateNested({ each: true })
	sports: SportDto[];
}
