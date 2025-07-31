import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { ResponseEventDto } from './response-event.dto';
import { Types } from 'mongoose';

export class EventInvitationItemDto {
	@ApiProperty()
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty({ type: () => ResponseEventDto })
	@Expose()
	@Type(() => ResponseEventDto)
	event: ResponseEventDto;

	@ApiProperty({ example: '2025-07-14T10:00:00.000Z' })
	@Expose()
	createdAt: Date;
}
