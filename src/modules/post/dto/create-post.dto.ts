import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HasExtension, HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

import { Visibility } from '@common/enums';

import { PostType } from '../types';

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
	@Transform(({ obj }) => {
		const o = obj as CreatePostDto;
		if (o.eventId) {
			delete o.files;
		}
		return o.files;
	})
	@Type(() => MemoryStoredFile)
	@HasExtension(['png', 'jpg', 'jpeg', 'gif', 'ogg', 'mp4'], { each: true })
	@HasMimeType(['image/*', 'video/*'], { each: true })
	@IsArray()
	@IsFile({ each: true })
	@IsOptional()
	files?: MemoryStoredFile[];

	@Expose()
	@IsMongoId()
	@IsOptional()
	@IsString()
	eventId?: string;

	@Expose()
	@Transform(({ obj }) => {
		return (obj as CreatePostDto).eventId ? PostType.EVENT : PostType.FILES;
	})
	@IsEnum(PostType)
	@IsOptional()
	postType?: PostType;

	@Expose()
	@Transform(({ obj, value }) => {
		const o = obj as CreatePostDto;
		return o.visibility === Visibility.LIMITED ? (value as string) : undefined;
	})
	@IsMongoId()
	@IsOptional()
	visibleToCommunityId?: string;

	@Expose()
	@Transform(({ obj, value }) => {
		const o = obj as CreatePostDto;
		return o.visibility === Visibility.LIMITED ? (value as string) : undefined;
	})
	@IsArray()
	@IsMongoId({ each: true })
	@IsOptional()
	visibleToUsersIds?: string[];

	@Expose()
	@Transform(({ obj, value }) => {
		const o = obj as CreatePostDto;
		return o.visibility === Visibility.LIMITED ? (value as string) : undefined;
	})
	@IsArray()
	@IsMongoId({ each: true })
	@IsOptional()
	invisibleToUsersIds?: string[];
}
