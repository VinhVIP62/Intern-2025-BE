import { IntersectionType, OmitType, PartialType, PickType } from '@nestjs/mapped-types';

import { ConcreteClass } from '@common/types/utils';

import {
	CreateEventPostDto,
	CreateFilePostDto,
	CreatePostDto,
	CreateSharePostDto,
} from './create-post.dto';

function UpdatePostDto<T extends CreatePostDto>(CreatePostDto: ConcreteClass<T>) {
	return IntersectionType(
		PartialType(OmitType(CreatePostDto, ['postType'])),
		PickType(CreatePostDto, ['postType']),
	);
}

export class UpdateFilePostDto extends UpdatePostDto(CreateFilePostDto) {}
export class UpdateSharePostDto extends OmitType(UpdatePostDto(CreateSharePostDto), [
	'parentPostId',
]) {}
export class UpdateEventPostDto extends UpdatePostDto(CreateEventPostDto) {}
