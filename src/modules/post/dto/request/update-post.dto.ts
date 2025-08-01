import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
	@IsString()
	@IsOptional()
	content?: string;

	@IsArray()
	@IsObject({ each: true })
	@IsOptional()
	images?: { url: string; publicId: string; type: string }[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	url?: string[];

	@IsOptional()
	@IsString()
	title?: string;
}
