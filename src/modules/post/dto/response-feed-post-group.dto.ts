import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PostResponseDto } from './response-posts.dto';

export class ResponseFeedPostGroupDto {
	@ApiProperty({ type: PostResponseDto, nullable: true })
	@Type(() => PostResponseDto)
	sharePost: PostResponseDto | null;

	@ApiProperty({ type: Boolean, description: 'Bài viết gốc có bị giới hạn quyền xem hay không' })
	sharedPostIsRestricted: boolean;

	@ApiProperty({ type: [PostResponseDto] })
	@Type(() => PostResponseDto)
	posts: PostResponseDto[];
}
