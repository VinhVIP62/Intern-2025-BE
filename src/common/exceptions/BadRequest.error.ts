import { CustomError } from './CustomError.error';

export class BadRequest extends CustomError {
	constructor(key = 'common.badRequest', args?: Record<string, any>) {
		super(key, args);
	}
}
