import { CustomError } from './CustomError.error';

export class TooManyRequests extends CustomError {
	constructor(key = 'common.tooManyRequests', args?: Record<string, any>) {
		super(key, args);
	}
}
