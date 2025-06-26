import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { LocationDto, SportDto } from './update-user.dto';

export class SetupUserDto {
	@Expose()
	@ValidateNested()
	@Type(() => LocationDto)
	location: LocationDto;

	@Expose()
	@IsArray()
	@Type(() => SportDto)
	@ValidateNested({ each: true })
	sports: SportDto[];
}
