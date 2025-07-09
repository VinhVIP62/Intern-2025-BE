import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class ResponseFriendDto {
	@ApiProperty()
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@Expose()
	@ApiProperty()
	fullName: string;

	@Expose()
	@ApiProperty()
	avatarUrl: string;
}
