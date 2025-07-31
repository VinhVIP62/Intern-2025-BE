import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type, Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { PostResponseDto } from './response-posts.dto';

export class SavedPostItemResponseDto {
	@ApiProperty({ example: '64d3fa9f2c7b3f1b3c2d4e8a', description: 'ID danh sách đã lưu' })
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty({ example: '64d3fa9f2c7b3f1b3c2d4e8a', description: 'ID danh sách đã lưu' })
	@Expose({ name: 'listId' })
	@Transform(({ obj }: { obj: { listId?: Types.ObjectId | string } }) => obj.listId?.toString())
	listId: string;

	@ApiProperty({ type: () => PostResponseDto, description: 'Thông tin bài viết đã lưu' })
	@Expose()
	@Type(() => PostResponseDto)
	post: PostResponseDto;

	@ApiProperty({ example: new Date().toISOString(), description: 'Thời điểm lưu bài viết' })
	@Expose()
	savedAt: Date;
}
