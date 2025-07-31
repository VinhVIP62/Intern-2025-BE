import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

export class ActorDto {
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

export class ResponseNotificationDto {
	@ApiProperty()
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id: Types.ObjectId } }) => obj._id.toString())
	_id: string;

	@ApiProperty({ type: () => ActorDto })
	@Expose({ name: 'actor' })
	@Type(() => ActorDto)
	actor: ActorDto;

	@ApiProperty()
	@Expose()
	type: string;

	@ApiPropertyOptional()
	@Expose()
	title?: string;

	@ApiPropertyOptional()
	@Expose()
	content?: string;

	@ApiPropertyOptional()
	@Expose({ name: 'metaRef' })
	@Transform(({ obj }: { obj: { metaRef: Types.ObjectId } }) => obj.metaRef.toString())
	metaRef?: string;

	@ApiPropertyOptional()
	@Expose()
	metaModel?: string;

	@ApiProperty()
	@Expose()
	isRead: boolean;

	@ApiProperty()
	@Expose()
	createdAt: Date;

	@ApiProperty()
	@Expose()
	updatedAt: Date;
}
