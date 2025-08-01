import {
	IsArray,
	IsDate,
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
} from 'class-validator';

export class UpdateEventDto {
	@IsOptional()
	@IsString()
	userId?: string;

	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsDateString()
	startDate?: Date;

	@IsOptional()
	@IsDateString()
	endDate?: Date;

	@IsOptional()
	@IsString()
	location?: string;

	@IsArray()
	@IsObject({ each: true })
	@IsOptional()
	images?: { url: string; publicId: string; type: string }[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	url?: string[];

	@IsOptional()
	@IsNumber()
	maxJoin?: number;
}
