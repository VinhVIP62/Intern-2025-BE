import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
	@IsString()
	@IsOptional()
	userId?: string;

	@IsString()
	@IsOptional()
	title?: string;

	@IsString()
	@IsOptional()
	content?: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	images?: string[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	imagesIds?: string[];

	@IsIn(['public', 'private', 'friends'])
	@IsString()
	privacy: string;
}
