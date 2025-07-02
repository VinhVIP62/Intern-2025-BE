import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreatePostDto {
	@IsString()
	title: string;

	@IsString()
	content: string;

	@IsOptional()
	@IsArray()
	mediaUrls?: string[];

	@IsOptional()
	@IsArray()
	taggedUserIds?: string[];
}
