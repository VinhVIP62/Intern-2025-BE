import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

export class EventCreatorDto {
	@ApiProperty()
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty()
	@Expose()
	fullName: string;

	@ApiProperty()
	@Expose()
	avatarUrl: string;
}

export class EventSportDto {
	@ApiProperty()
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty()
	@Expose()
	name: string;
}

export class ResponseEventDto {
	@ApiProperty()
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty()
	@Expose()
	title: string;

	@ApiPropertyOptional()
	@Expose()
	description?: string;

	@ApiPropertyOptional({ type: [String] })
	@Expose()
	imageUrls?: string[];

	@ApiProperty({ type: () => EventCreatorDto })
	@Expose({ name: 'creator' })
	@Type(() => EventCreatorDto)
	creator: EventCreatorDto;

	@ApiPropertyOptional({ type: () => EventSportDto })
	@Expose({ name: 'sport' })
	@Type(() => EventSportDto)
	sport?: EventSportDto;

	@ApiProperty({
		example: {
			type: 'Point',
			coordinates: [106.660172, 10.762622],
			address: '123 Lê Lợi, Quận 1',
			city: 'Hồ Chí Minh',
			district: 'Quận 1',
		},
	})
	@Expose()
	location: {
		type: 'Point';
		coordinates: [number, number];
		address: string;
		city: string;
		district: string;
	};

	@ApiProperty()
	@Expose()
	time: Date;

	@ApiProperty()
	@Expose()
	maxParticipants: number;

	@ApiProperty()
	@Expose()
	isPublic: boolean;

	@ApiProperty()
	@Expose()
	requiresApproval: boolean;

	@ApiProperty()
	@Expose()
	createdAt: Date;

	@ApiProperty()
	@Expose()
	updatedAt: Date;
}
