import { Privacy } from '@modules/post/enum/privacy.enum';
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

	@IsArray()
	@IsOptional()
	images?: { url: string; publicId: string; type: string }[];

	@IsIn(Object.values(Privacy))
	@IsString()
	@IsOptional()
	privacy?: string;

	@IsString()
	@IsOptional()
	originalPostId?: string;

	@IsString()
	@IsOptional()
	originalPostUserId?: string;

	@IsString()
	@IsOptional()
	originalPrivacy?: string;
}
