import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdatePostDto {
	@IsString()
	@IsOptional()
	title?: string;

	@IsString()
	@IsOptional()
	content?: string;

	@IsOptional()
	@IsArray()
	mediaUrls?: string[];

	@IsOptional()
	@IsArray()
	taggedUserIds?: string[];
}
