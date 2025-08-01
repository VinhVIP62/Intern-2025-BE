import { Expose } from 'class-transformer';

export class EventResponseDto {
	@Expose()
	_id: string;

	@Expose()
	title: string;

	@Expose()
	startDate: Date;

	@Expose()
	endDate: Date;

	@Expose()
	description: string;

	@Expose()
	location: string;

	@Expose()
	images: string[];

	@Expose()
	userJoin: number;

	@Expose()
	authorId: string;

	@Expose()
	isJoined: string;
}

export class userJoinedEventResponseDto {
	@Expose()
	id: string;

	@Expose()
	fullName: string;

	@Expose()
	avatar: string;

	@Expose()
	createdAt: Date;
}
