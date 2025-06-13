import { Exclude, Expose } from 'class-transformer';

export class ResponseUserDto {
	@Expose()
	_id: string;

	@Expose()
	username: string;

	@Exclude()
	password: string;

	@Expose()
	roles: string[];

	@Expose()
	createdAt?: Date;

	@Expose()
	updatedAt?: Date;
}
