import { PostState } from '@common/enum/post/post.state.enum';
import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

export class CreatePostDto {
	@IsString()
	title: string;

	@IsString()
	content: string;

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
