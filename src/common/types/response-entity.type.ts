import { PaginatedData } from './paginated-data.type';

export type ErrorMessage = {
	[key: string]: string;
};

export class ResponseEntity<T> {
	constructor(path: string, statusCode: number, data: T, error?: string | ErrorMessage) {
		this.path = path;
		this.statusCode = statusCode;
		this.timestamp = Date.now();
		if (error) {
			this.success = false;
			this.error = error;
		} else {
			this.success = true;
			this.data = data;
		}
	}

	/** API path */
	path: string;

	/** HTTP status code */
	statusCode: number;

	success: boolean;

	timestamp: Date | string | number;

	/** Error message if there's one */
	error?: string | ErrorMessage;

	/** Set as null if there's no error */
	data: T;
}

export class PaginatedResponseEntity<T> extends ResponseEntity<T[]> {
	constructor(path: string, statusCode: number, paginatedData: PaginatedData<T>, error?: string) {
		super(path, statusCode, paginatedData.data, error);
		this.page = paginatedData.page;
		this.amount = paginatedData.limit;
	}

	page: number;
	amount: number;
}
