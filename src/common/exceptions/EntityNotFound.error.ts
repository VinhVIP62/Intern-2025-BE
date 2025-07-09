import { CustomError } from './CustomError.error';

export class EntityNotFound extends CustomError {
	constructor(key = 'common.notFound', args?: Record<string, any>) {
		super(key, args);
	}
}
