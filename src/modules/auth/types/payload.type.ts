import { Role } from '@common/enum';
import { Expose } from 'class-transformer';

export class Sub {
	@Expose()
	id: string;

	@Expose()
	roles: Role[];

	@Expose()
	hasFinishedSetup: boolean;
}

export class Payload {
	username?: string;
	sub: Sub;
}
