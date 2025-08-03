import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { PostState } from '@common/enum/post/post.state.enum';

export class UpdatePostDto {
	@IsString()
	@IsOptional()
	title?: string;

	@IsString()
	@IsOptional()
	content?: string;

	@IsEnum(PostState)
	@IsOptional()
	state?: PostState;

	@IsOptional()
	@IsArray()
	mediaUrls?: string[];

	@IsOptional()
	@IsArray()
	taggedUserIds?: string[];
}
