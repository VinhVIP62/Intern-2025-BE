import { Exclude, Expose, Transform, Type } from 'class-transformer';

import { WithPopulated } from '@common/crud/entities';

import { User } from '@modules/user/entities';

import { Comment } from '../../comment/entities';

@Exclude()
export class ResponseCommentDto {
	@Expose()
	id!: string;

	@Expose()
	@Type(() => String)
	userId!: string;

	@Expose()
	@Transform(({ obj }) => {
		const user = (obj as WithPopulated<Comment>)?.userIdPopulated as User | null;
		if (!user) return null;
		return {
			username: user.username,
			avatarUrl: user.avatarUrl,
		};
	})
	creator!: User;

	@Expose()
	content!: string;

	@Expose()
	fileUrls!: string[] | null;

	@Expose()
	childrenCount!: number;

	@Expose()
	createdAt!: Date;

	@Expose()
	updatedAt!: Date;
}
