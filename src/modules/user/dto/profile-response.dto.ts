import { Location } from '../entities';
import { ResponseUserDto } from './user-response.dto';
import { Exclude, Expose } from 'class-transformer';

// NOT THE SAME AS ResponseUserDto
@Exclude()
export class ResponseProfileDto extends ResponseUserDto {
	@Expose()
	mail: string;

	@Expose()
	phone: string;

	@Expose()
	createdAt?: Date;

	@Expose()
	updatedAt?: Date;

	// Override
	@Expose()
	declare location: Location;

	@Expose()
	hasFinishedSetup: boolean;
}
