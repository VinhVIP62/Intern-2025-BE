import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CommentAuthorDto {
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

export class CommentResponseDto {
	@ApiProperty()
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty({ type: CommentAuthorDto })
	@Expose({ name: 'author' })
	@Type(() => CommentAuthorDto)
	@ApiProperty({ type: CommentAuthorDto })
	author: CommentAuthorDto;

	@ApiProperty()
	@Expose({ name: 'postId' })
	@Transform(({ obj }: { obj: { postId?: Types.ObjectId | string } }) => obj.postId?.toString())
	postId: string;

	@Expose()
	@ApiProperty()
	content: string;

	@ApiProperty({ example: '123' })
	@Expose()
	likeCount: number;

	@ApiProperty({ example: '23' })
	@Expose()
	commentCount: number;

	@ApiProperty({ example: 'true' })
	@Expose()
	isLiked: boolean;

	@Expose()
	@ApiProperty()
	createdAt: Date;

	@Expose()
	@ApiProperty()
	updatedAt: Date;
}
