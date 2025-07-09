import { CustomError } from './CustomError.error';

export class InternalServerError extends CustomError {
	constructor(key = 'common.internalServerError', args?: Record<string, any>) {
		super(key, args);
	}
}
