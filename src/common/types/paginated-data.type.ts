import { IsArray, IsNumber } from 'class-validator';

export class PaginatedData<T> {
	@IsNumber()
	page: number;

	@IsNumber()
	limit: number;

	@IsArray()
	data: T[];
}
