import { Exclude, Expose } from 'class-transformer';

export class ResponseUserDto {
	@Expose()
	readonly id: string;

	@Expose()
	readonly username: string;

	@Expose()
	readonly fullName: string;

	@Exclude()
	readonly password: string;
}
