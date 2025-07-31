import { ApiProperty } from '@nestjs/swagger';
import { ResponseFeedPostGroupDto } from './response-feed-post-group.dto';
import { PagingMetaDto } from './paginated-posts-response.dto';

export class PaginatedFeedPostResponseDto {
	@ApiProperty({ type: [ResponseFeedPostGroupDto] })
	items: ResponseFeedPostGroupDto[];

	@ApiProperty({ type: PagingMetaDto })
	meta: PagingMetaDto;
}
