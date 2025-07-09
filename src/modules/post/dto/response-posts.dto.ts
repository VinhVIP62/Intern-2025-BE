import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

export class PostAuthorDto {
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

export class PostResponseDto {
	@ApiProperty({ example: 'dfew2...' })
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty({ description: 'ID người đăng bài' })
	@Expose({ name: 'author' })
	@Type(() => PostAuthorDto)
	author: PostAuthorDto;

	@ApiProperty({ example: 'Chơi thể thao' })
	@Expose()
	title: string;

	@ApiProperty({ example: 'Tốt cho sức khỏe' })
	@Expose()
	content: string;

	@ApiProperty({ type: [String], required: false, example: ['image.jpg'] })
	@Expose()
	imageUrls?: string[];

	@ApiProperty({ enum: ['public', 'friends', 'private'] })
	@Expose()
	visibility: string;

	@ApiProperty({ example: '123' })
	@Expose()
	likeCount: number;

	@ApiProperty({ example: '23' })
	@Expose()
	commentCount: number;

	@ApiProperty({ example: 'true' })
	@Expose()
	isLiked: boolean;

	@ApiProperty()
	@Expose()
	createdAt: Date;

	@ApiProperty()
	@Expose()
	updatedAt: Date;
}
