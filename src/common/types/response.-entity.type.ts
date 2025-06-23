export type ResponseEntity<T> = {
	success: boolean;

	// contains error message if there's one, else response won't include this field
	error?: string;

	// if there's an error, data will be null
	data: T;
};

