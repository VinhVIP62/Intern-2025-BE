import { IsArray, IsNumber } from 'class-validator';

export class PaginatedData<T> {
	constructor(page: number, limit: number, data: T[]) {
		this.page = page;
		this.data = data;
		this.limit = limit;
	}

	@IsNumber()
	page: number = 1;

	@IsNumber()
	limit: number = 10;

	// eslint-disable-next-line @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator
	@IsArray()
	/** Generic array's type can't be inferred unfortunately */
	data: T[] = [];
}
