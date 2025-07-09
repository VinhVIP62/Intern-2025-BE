import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
	@IsString()
	@IsNotEmpty()
	content: string;

	@IsString()
	@IsNotEmpty()
	postId: string;

	@IsNotEmpty()
	@IsString()
	userId: string;

	@IsOptional()
	@IsBoolean()
	isOriginal?: boolean = true;
}
