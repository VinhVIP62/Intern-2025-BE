import { Expose, Type } from 'class-transformer';
import { IsArray, IsNotEmptyObject, IsOptional, ValidateNested } from 'class-validator';
import { LocationDto, SportDto } from './update-user.dto';

export class SetupUserDto {
	@IsOptional()
	@Expose()
	@Type(() => LocationDto)
	@ValidateNested()
	@IsNotEmptyObject()
	location: LocationDto;

	@Expose()
	@IsArray()
	@Type(() => SportDto)
	@ValidateNested()
	sports: SportDto[];
}
