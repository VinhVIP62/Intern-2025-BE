import { CustomError } from './CustomError.error';

export class Unauthorized extends CustomError {
	constructor(key = 'common.unauthorized', args?: Record<string, any>) {
		super(key, args);
	}
}
