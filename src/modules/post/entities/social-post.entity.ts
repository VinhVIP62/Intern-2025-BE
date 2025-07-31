import { ISoftDeletableEntity } from '@common/crud/entities';
import { Visibility } from '@common/enums';

import { PostType } from '../enums';

export class SocialPost extends ISoftDeletableEntity {
	visibility!: Visibility;
	content!: string | null;

	userId!: string;
	// if there's event, file is set to null
	// PostType.FILES
	fileUrls!: string[] | null;
	// PostType.EVENT
	embeddedEventId!: string | null;
	// PostType.SHARED
	parentPostId!: string | null;
	postType!: PostType;
	// ignore
	visibleToCommunityId!: string | null;
	visibleToUsersIds!: string[];
	invisibleToUsersIds!: string[];
	sharedCount?: number;
}
