export type ExceptionResponse =
	| string
	| {
			statusCode?: number;
			message?: string | string[];
			error?: string;
	  };
