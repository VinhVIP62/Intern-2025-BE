import { OmitType } from '@nestjs/mapped-types';
import { Exclude, Expose, Transform } from 'class-transformer';

import { Status } from '@common/enums';

import { Location, Sport } from '../entities';

@Exclude()
export class ResponseUserDto {
	@Expose()
	id!: string;

	@Expose()
	username!: string;

	@Expose()
	roles!: string[];

	@Expose()
	avatarUrl!: string | null;

	@Expose()
	@Transform(({ obj, value }) =>
		obj instanceof ResponseUserDto && (value as Location).hidden ? undefined : (value as Location),
	)
	location!: Location;

	@Expose()
	status!: Status;

	@Expose()
	sports!: Sport[];
}

@Exclude()
export class LimitedUserResponseDto extends OmitType(ResponseUserDto, [
	'id',
	'location',
	'roles',
]) {}
