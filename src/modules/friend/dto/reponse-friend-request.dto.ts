import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type, Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class SenderDto {
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

export class ResponseFriendRequestDto {
	@ApiProperty({ description: 'ID lời mời kết bạn' })
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty({ description: 'ID người nhận' })
	@Expose({ name: 'receiver' })
	@Transform(({ obj }: { obj: { receiver?: Types.ObjectId | string } }) => obj.receiver?.toString())
	receiver: string;

	@ApiProperty({ description: 'Trạng thái lời mời', enum: ['pending', 'accepted', 'rejected'] })
	@Expose()
	status: string;

	@ApiProperty({ description: 'Ngày tạo lời mời', type: String, format: 'date-time' })
	@Expose()
	createdAt: Date;

	@ApiProperty({ description: 'Thông tin người gửi lời mời' })
	@Expose({ name: 'sender' })
	@Type(() => SenderDto)
	sender: SenderDto;
}
