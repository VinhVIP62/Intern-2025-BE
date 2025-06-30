import { IsArray, IsNumber } from 'class-validator';

export class PaginatedData<T> {
	@IsNumber()
	page: number = 1;

	@IsNumber()
	limit: number = 10;

	@IsArray()
	data: T[] = [];
}
