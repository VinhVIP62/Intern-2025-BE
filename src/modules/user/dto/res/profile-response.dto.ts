import { Exclude, Expose, Transform, Type } from 'class-transformer';

import { WithPopulated } from '@common/crud/entities';

import { GoogleLoginInfo, Location, User } from '../../entities';
import { ResponseUserDto } from './user-response.dto';

// NOT THE SAME AS ResponseUserDto
@Exclude()
export class ResponseProfileDto extends ResponseUserDto {
	@Expose()
	mail!: string;

	@Expose()
	phone!: string;

	@Expose()
	declare location: Location;

	@Expose()
	hasFinishedSetup!: boolean;

	@Expose()
	createdAt!: Date;

	@Expose()
	updatedAt!: Date;

	@Expose()
	deleted!: boolean;

	@Expose()
	deletedAt!: Date | null;

	@Expose()
	@Type(() => String)
	deletedBy!: string | null;

	@Expose()
	@Transform(({ obj }) => {
		const user = (obj as WithPopulated<User>)?.deletedByPopulated as User | null;
		if (!user) return null;
		return {
			username: user.username,
			avatarUrl: user.avatarUrl,
		};
	})
	deletedByUser!: Partial<Pick<User, 'username' | 'avatarUrl'>> | null;

	@Expose()
	googleLoginInfo!: GoogleLoginInfo | null;
}
