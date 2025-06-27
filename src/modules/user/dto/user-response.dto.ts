import { Exclude, Expose, Transform } from 'class-transformer';
import { Location, Sport } from '../entities';
import { Status } from '@common/enum';

@Exclude()
export class ResponseUserDto {
	@Expose()
	_id: string;

	@Expose()
	username: string;

	@Expose()
	roles: string[];

	@Expose()
	avatarUrl: string;

	@Expose()
	@Transform(({ obj, value }) =>
		obj instanceof ResponseUserDto && (value as Location).hidden ? undefined : (value as Location),
	)
	location: Location;

	@Expose()
	status: Status;

	@Expose()
	sports: Sport;
}
