import { ISoftDeletableEntity } from '@common/crud/entities';
import { Visibility } from '@common/enums';

import { PostType } from '../types';

export class SocialPost implements ISoftDeletableEntity {
	id!: string;
	visibility!: Visibility;
	title!: string;
	content!: string;

	userId!: string;
	// if there's event, file is set to null
	fileUrls!: string[] | null;
	embeddedEventId!: string | null;
	postType!: PostType;

	createdAt!: Date;
	updatedAt!: Date;
	deleted!: boolean;
	deletedAt!: Date | null;
	deletedBy!: string | null;

	// ignore
	visibleToCommunityId!: string | null;
	visibleToUsersIds!: string[];
	invisibleToUsersIds!: string[];

	// [PLA] possible fields for future
	// embeddedEventId: string
}
