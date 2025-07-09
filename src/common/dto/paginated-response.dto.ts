export interface PageMetaDto {
	total: number;
	page: number;
	limit: number;
}

export interface PaginatedResponse<T> {
	items: T[];
	meta: PageMetaDto;
}
