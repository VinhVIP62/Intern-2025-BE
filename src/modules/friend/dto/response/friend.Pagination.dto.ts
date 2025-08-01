export class FriendPaginationDto {
	users: {
		id: string;
		fullName: string;
		avatar: string;
		description: string;
		createdAt: Date;
	}[];
	pagination: {
		total: number;
		page?: number;
		limit?: number;
		totalPages?: number;
		hasNextPage?: boolean;
		hasPreviousPage?: boolean;
	};
}
