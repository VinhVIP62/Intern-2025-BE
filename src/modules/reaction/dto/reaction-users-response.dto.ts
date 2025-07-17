import { Exclude, Expose, Transform } from 'class-transformer';

import { ReactionUser } from '../repositories';

@Exclude()
export class ResponseReactionUsersDto {
	@Expose()
	id!: string;

	@Expose()
	@Transform(({ obj }) => (obj as ReactionUser).user?.avatarUrl, { toClassOnly: true })
	avatarUrl!: string;

	@Expose()
	@Transform(({ obj }) => (obj as ReactionUser).user?.username, { toClassOnly: true })
	username!: string;
}
