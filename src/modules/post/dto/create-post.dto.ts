import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HasExtension, HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

import { Visibility } from '@common/enums';

import { PostType } from '../enums';

export class CreatePostDto {
	@Expose()
	@IsNotEmpty()
	@IsString()
	title!: string;

	@Expose()
	@IsNotEmpty()
	@IsString()
	content!: string;

	@Expose()
	@IsEnum(Visibility)
	visibility!: Visibility;

	@Expose()
	@IsEnum(PostType)
	postType!: PostType;

	@Expose()
	@IsMongoId()
	@IsOptional()
	visibleToCommunityId?: string;

	@Expose()
	@IsArray()
	@IsMongoId({ each: true })
	@IsOptional()
	visibleToUsersIds?: string[];

	@Expose()
	@IsArray()
	@IsMongoId({ each: true })
	@IsOptional()
	invisibleToUsersIds?: string[];
}

export class CreateFilePostDto extends CreatePostDto {
	@Expose()
	@Type(() => MemoryStoredFile)
	@HasExtension(['png', 'jpg', 'jpeg', 'gif', 'ogg', 'mp4', 'webp'], { each: true })
	@HasMimeType(['image/*', 'video/*'], { each: true })
	@IsArray()
	@IsFile({ each: true })
	@IsOptional()
	files?: MemoryStoredFile[];

	@Expose()
	@Transform(() => PostType.FILES)
	@IsEnum(PostType)
	declare postType: PostType.FILES;
}

export class CreateSharePostDto extends CreatePostDto {
	@Expose()
	@Type(() => String)
	@IsMongoId()
	@IsString()
	parentPostId!: string;

	@Expose()
	@Transform(() => PostType.SHARED)
	@IsEnum(PostType)
	declare postType: PostType.SHARED;
}

export class CreateEventPostDto extends CreatePostDto {
	@Expose()
	@Type(() => String)
	@IsMongoId()
	@IsString()
	eventId!: string;

	@Expose()
	@Transform(() => PostType.EVENT)
	@IsEnum(PostType)
	declare postType: PostType.EVENT;
}
