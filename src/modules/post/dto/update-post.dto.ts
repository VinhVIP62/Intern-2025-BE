import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
	@IsString()
	@IsOptional()
	content?: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	image?: string[];

	@IsOptional()
	@IsString()
	title?: string;
}
