import { Exclude, Expose } from 'class-transformer';

import { GoogleLoginInfo, Location } from '../entities';
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
	deletedBy!: string | null;

	@Expose()
	googleLoginInfo!: GoogleLoginInfo;
}
