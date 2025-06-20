export class ResponseEntity<T> {
	/** API path */
	path: string;

	/** HTTP status code */
	statusCode: number;

	success: boolean;

	timestamp: Date | string | number;

	/** Error message if there's one */
	error?: string;

	/** Set as null if there's no error */
	data: T;
}

export type PaginatedResponseEntity<T> = ResponseEntity<T> & {
	page: number;
	amount: number;
};
