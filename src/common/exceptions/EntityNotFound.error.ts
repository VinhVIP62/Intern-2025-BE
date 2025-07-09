import { CustomError } from './CustomError.error';
import { Class } from '@common/types/class.type';

export class EntityNotFound<T> extends CustomError {
	constructor(clazz: Class<T>) {
		super(`${clazz.name} entity not found`);
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = this.constructor.name;
	}
}
