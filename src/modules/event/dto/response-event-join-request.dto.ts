import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

class UserShortDto {
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

export class EventJoinRequestDto {
	@ApiProperty()
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty({ enum: ['pending', 'accepted', 'rejected', 'cancelled'] })
	@Expose()
	status: string;

	@ApiProperty({ type: () => UserShortDto })
	@Expose({ name: 'user' })
	@Type(() => UserShortDto)
	user: UserShortDto;

	@ApiProperty()
	@Expose()
	createdAt: Date;
}
