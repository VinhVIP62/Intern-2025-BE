import { EventState } from '@common/enum/event.state';
import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsArray,
	ValidateNested,
	IsDateString,
	ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Sports } from '@common/enum/sports.enum';
import { IsGeoCoordinates } from '@common/validators/is.geo.coordinate';

class LocationDto {
	@IsEnum(['Point'])
	type: 'Point';

	@IsArray()
	@ArrayNotEmpty()
	@Type(() => Number)
	@IsGeoCoordinates()
	coordinates: [number, number];
}

export class CreateEventDto {
	@IsNotEmpty()
	@IsString()
	title: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsEnum(EventState)
	@IsOptional()
	state?: EventState;

	@ValidateNested()
	@Type(() => LocationDto)
	location: LocationDto;

	@IsDateString()
	startTime: Date;

	@IsDateString()
	@IsOptional()
	endTime?: Date;

	@IsArray()
	@IsEnum(Sports, { each: true })
	sportInterests: Sports[];

	@IsArray()
	@IsOptional()
	@IsString({ each: true })
	mediaUrls?: string[];
}
