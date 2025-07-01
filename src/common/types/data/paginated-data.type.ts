import { IsArray, IsNumber } from 'class-validator';

export class PaginatedData<T> {
	@IsNumber()
	page: number = 1;

	@IsNumber()
	limit: number = 10;

	// eslint-disable-next-line @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator
	@IsArray()
	/** Generic array's type can't be inferred unfortunately */
	data: T[] = [];
}
