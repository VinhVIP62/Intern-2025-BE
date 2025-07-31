import { EventSportDto } from '@modules/event/dto/response-event.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

class MediaResponseItemDto {
	@ApiProperty()
	@Expose()
	url: string;

	@ApiProperty()
	@Expose()
	type: string;
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

	@ApiProperty({ type: [MediaResponseItemDto] })
	@Expose({ name: 'media' })
	@Type(() => MediaResponseItemDto)
	media?: MediaResponseItemDto[];

	@ApiPropertyOptional({ type: () => [EventSportDto] })
	@Expose({ name: 'sports' })
	@Type(() => EventSportDto)
	sports?: EventSportDto[];

	@ApiProperty({
		example: {
			type: 'Point',
			coordinates: [106.660172, 10.762622],
			address: '123 Lê Lợi, Quận 1',
			city: 'Hồ Chí Minh',
			district: 'Quận 1',
		},
	})
	@Expose()
	location: {
		type: 'Point';
		coordinates: [number, number];
		address: string;
		city: string;
		district: string;
	};

	@Expose()
	@ApiPropertyOptional({
		type: () => [PostAuthorDto],
		description: 'Danh sách bạn bè được gắn thẻ',
	})
	@Type(() => PostAuthorDto)
	taggedFriends?: PostAuthorDto[];

	@ApiPropertyOptional({ type: [String], description: 'Danh sách hashtag' })
	@Expose()
	hashtags?: string[];

	@Expose()
	@Type(() => PostResponseDto)
	@ApiPropertyOptional({ type: () => PostResponseDto })
	sharedPost?: PostResponseDto;

	@ApiPropertyOptional({ description: 'Shared post đã bị giới hạn quyền xem hay không' })
	@Expose()
	sharedPostIsRestricted?: boolean;

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
