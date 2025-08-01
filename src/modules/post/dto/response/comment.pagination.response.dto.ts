import { CommentResponseDto } from './comment-response.dto';

export class CommentPaginationResponseDto {
	comments: CommentResponseDto[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasPreviousPage: boolean;
		hasNextPage: boolean;
	};
}
