import { Expose, Transform } from 'class-transformer';

import { WithPopulated } from '@common/crud/entities';
import { Visibility } from '@common/enums';

import { User } from '@modules/user/entities';

import { SocialPost } from '../entities';

export class ResponsePostDto {
	@Expose()
	id!: string;

	@Expose()
	visibility!: Visibility;

	@Expose()
	title!: string;

	@Expose()
	content!: string;

	@Expose()
	fileUrls!: string[] | null;

	@Expose()
	userId!: string;

	@Expose()
	@Transform(({ obj }) => {
		const user = (obj as WithPopulated<SocialPost>)?.userIdPopulated as User | null;
		if (!user) return null;
		return {
			username: user.username,
			avatarUrl: user.avatarUrl,
		};
	})
	creator!: User;

	@Expose()
	createdAt!: Date;

	@Expose()
	updatedAt!: Date;

	@Expose()
	deleted!: boolean;

	@Expose()
	deletedAt!: Date | null;

	@Expose()
	deletedBy!: string | null;

	@Expose()
	@Transform(({ obj }) => {
		const user = (obj as WithPopulated<SocialPost>)?.deletedByPopulated as User | null;
		if (!user) return null;
		return {
			username: user.username,
			avatarUrl: user.avatarUrl,
		};
	})
	deletedByUser!: Partial<Pick<User, 'username' | 'avatarUrl'>> | null;

	// ignore
	@Expose()
	visibleToCommunityId!: string | null;

	@Expose()
	visibleToUsersIds!: string[];

	@Expose()
	invisibleToUsersIds!: string[];

	// [PLA] possible fields for future
	// embeddedEventId: string
}
