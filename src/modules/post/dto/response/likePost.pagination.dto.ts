export class LikePostPaginationDto {
	users: string[];
	pagination: {
		total: number;
		page?: number;
		limit?: number;
		totalPages?: number;
		hasNextPage?: boolean;
		hasPreviousPage?: boolean;
	};
}
