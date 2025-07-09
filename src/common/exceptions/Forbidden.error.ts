import { CustomError } from './CustomError.error';

export class Forbidden extends CustomError {
	constructor(key = 'common.forbidden', args?: Record<string, any>) {
		super(key, args);
	}
}
