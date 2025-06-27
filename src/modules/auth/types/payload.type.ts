import { Expose } from 'class-transformer';

export class Sub {
	@Expose()
	id: string;

	@Expose()
	roles: string[];

	@Expose()
	hasFinishedSetup: boolean;
}

export class Payload {
	username?: string;
	sub: Sub;
}
