import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

export class MessageSenderDto {
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

class MediaItemDto {
	@ApiProperty()
	@Expose()
	url: string;

	@ApiProperty()
	@Expose()
	type: string;
}

export class ResponseMessageDto {
	@ApiProperty()
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty()
	@Expose({ name: 'conversationId' })
	@Transform(({ obj }: { obj: { conversationId?: Types.ObjectId | string } }) =>
		obj.conversationId?.toString(),
	)
	conversationId: string;

	@ApiProperty({ type: () => MessageSenderDto })
	@Expose({ name: 'sender' })
	@Type(() => MessageSenderDto)
	sender: MessageSenderDto;

	@ApiProperty()
	@Expose()
	text: string;

	@ApiProperty({ type: [MediaItemDto] })
	@Expose({ name: 'media' })
	@Type(() => MediaItemDto)
	media?: MediaItemDto[];

	@ApiPropertyOptional({ type: ResponseMessageDto })
	@Expose()
	@Type(() => ResponseMessageDto)
	replyTo?: ResponseMessageDto;

	@ApiProperty({ enum: ['sent', 'delivered', 'seen'] })
	@Expose()
	status: 'sent' | 'delivered' | 'seen';

	@ApiProperty()
	@Expose()
	isRevoked: boolean;

	@ApiProperty()
	@Expose()
	createdAt: Date;

	@ApiProperty()
	@Expose()
	updatedAt: Date;
}
