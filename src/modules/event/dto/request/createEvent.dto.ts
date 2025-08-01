import {
	IsArray,
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
} from 'class-validator';

export class CreateEventDto {
	@IsNotEmpty()
	@IsString()
	title: string;

	@IsNotEmpty()
	@IsString()
	description: string;

	@IsNotEmpty()
	@IsDateString()
	startDate: Date;

	@IsNotEmpty()
	@IsDateString()
	endDate: Date;

	@IsNotEmpty()
	@IsString()
	location: string;

	@IsArray()
	@IsOptional()
	images?: { url: string; publicId: string; type: string }[];

	@IsString()
	@IsOptional()
	authorId?: string;

	@IsString()
	@IsOptional()
	maxJoin?: string;
}
