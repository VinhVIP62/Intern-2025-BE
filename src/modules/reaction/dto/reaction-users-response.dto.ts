import { Exclude, Expose, Transform } from 'class-transformer';

import { WithPopulated } from '@common/crud/entities';

import { User } from '@modules/user/entities';

import { Reaction } from '../entities';

@Exclude()
export class ResponseReactionUsersDto {
	@Expose()
	id!: string;

	@Expose()
	@Transform(({ obj }) => ((obj as WithPopulated<Reaction>).userIdPopulated as User)?.avatarUrl)
	avatarUrl!: string;

	@Expose()
	@Transform(({ obj }) => ((obj as WithPopulated<Reaction>).userIdPopulated as User)?.username)
	username!: string;
}
