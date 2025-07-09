import { CustomError } from './CustomError.error';

export class Conflict extends CustomError {
	constructor(key = 'common.conflict', args?: Record<string, any>) {
		super(key, args);
	}
}
