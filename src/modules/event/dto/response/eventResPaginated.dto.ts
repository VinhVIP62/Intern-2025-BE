import { EventResponseDto, userJoinedEventResponseDto } from './eventResponse.dto';

export class EventResPaginatedDto {
	events: EventResponseDto[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasPreviousPage: boolean;
		hasNextPage: boolean;
	};
}
export class UserJoinedEventResPaginatedDto {
	users: userJoinedEventResponseDto[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasPreviousPage: boolean;
		hasNextPage: boolean;
	};
}
