import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';
import { ResponseMessageDto } from './response-message.dto';

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

export class ResponseConversationDto {
	@ApiProperty()
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty({ type: String })
	@Expose()
	name: string;

	@ApiProperty({ type: String })
	@Expose()
	avatarUrl: String;

	@ApiPropertyOptional({ type: MessageSenderDto })
	@Expose()
	@Type(() => MessageSenderDto)
	owner?: MessageSenderDto;

	@ApiProperty({ type: [MessageSenderDto] })
	@Expose()
	@Type(() => MessageSenderDto)
	participants: MessageSenderDto[];

	@ApiProperty({ type: ResponseMessageDto, required: false })
	@Expose()
	@Type(() => ResponseMessageDto)
	lastMessage?: ResponseMessageDto;

	@ApiProperty({ type: Boolean })
	@Expose()
	isGroup: boolean;

	@ApiProperty()
	@Expose()
	createdAt: Date;

	@ApiProperty()
	@Expose()
	updatedAt: Date;
}
