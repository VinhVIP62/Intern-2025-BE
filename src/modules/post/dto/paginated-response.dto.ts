import { PostResponseDto } from './post-response.dto';

export class PaginatedResponseDto {
	paginatedPosts: PostResponseDto[];
	pagination: {
		total: number;
		page?: number;
		limit?: number;
		totalPages?: number;
		hasNextPage?: boolean;
		hasPreviousPage?: boolean;
	};
}
