import { ApiProperty } from '@nestjs/swagger';
import { ResponseConversationDto } from './response-conversation.dto';

export class PagingMetaDto {
	@ApiProperty({ example: '20' })
	total: number;

	@ApiProperty({ example: '1' })
	page: number;

	@ApiProperty({ example: '10' })
	limit: number;
}

// Không thể dùng generic với Swagger, nên cần tạo class cụ thể nếu muốn mô tả được `data` type
export class PaginatedConversationResponseDto {
	@ApiProperty({ example: 'Lấy danh sách bài viết thành công' })
	message: string;

	@ApiProperty({ type: [ResponseConversationDto] })
	data: ResponseConversationDto[];

	@ApiProperty({ type: PagingMetaDto })
	meta: PagingMetaDto;
}
