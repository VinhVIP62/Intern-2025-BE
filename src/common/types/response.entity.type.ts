export type ResponseEntity<T> = {
	success: boolean;

	// HTTP status code
	statusCode?: number;

	// Success or error message
	message?: string;

	// contains error message if there's one, else response won't include this field
	error?: string;

	// if there's an error, data will be null
	data?: T;
};
