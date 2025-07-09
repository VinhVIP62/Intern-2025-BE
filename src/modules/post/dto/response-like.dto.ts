import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

export class LikeAuthorDto {
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

export class ResponseLikeDto {
	@ApiProperty()
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty({ type: LikeAuthorDto })
	@Expose({ name: 'author' })
	@Type(() => LikeAuthorDto)
	@ApiProperty({ type: LikeAuthorDto })
	author: LikeAuthorDto;

	@Expose({ name: 'targetId' })
	@ApiProperty({ description: 'ID bài viết hoặc bình luận' })
	@Transform(({ obj }: { obj: { targetId?: Types.ObjectId | string } }) => obj.targetId?.toString())
	targetId: string;

	@Expose()
	@ApiProperty({ enum: ['Post', 'Comment'], description: 'Loại nội dung được like' })
	targetType: 'Post' | 'Comment';

	@Expose()
	@ApiProperty({
		enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
		description: 'Loại cảm xúc',
	})
	reactionType: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

	@Expose()
	@ApiProperty()
	createdAt: Date;

	@Expose()
	@ApiProperty()
	updatedAt: Date;
}
