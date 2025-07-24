import { Expose, Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HasExtension, HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

import { MAX_FILES_NUM } from '@common/constants';
import { IsValidId } from '@common/decorators/class-validator';
import { Visibility } from '@common/enums';

import { PostType } from '../../enums';

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
	@IsOptional()
	@IsValidId()
	visibleToCommunityId?: string;

	@Expose()
	@IsArray()
	@IsOptional()
	@IsValidId({ each: true })
	visibleToUsersIds?: string[];

	@Expose()
	@IsArray()
	@IsOptional()
	@IsValidId({ each: true })
	invisibleToUsersIds?: string[];
}

export class CreateFilePostDto extends CreatePostDto {
	@Expose()
	@Type(() => MemoryStoredFile)
	@ArrayMaxSize(MAX_FILES_NUM)
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
	@Transform(() => PostType.SHARED)
	@IsEnum(PostType)
	declare postType: PostType.SHARED;
}

export class CreateEventPostDto extends CreatePostDto {
	@Expose()
	@Type(() => String)
	@IsString()
	@IsValidId()
	eventId!: string;

	@Expose()
	@Transform(() => PostType.EVENT)
	@IsEnum(PostType)
	declare postType: PostType.EVENT;
}
