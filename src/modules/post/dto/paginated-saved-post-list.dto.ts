import { ApiProperty } from '@nestjs/swagger';
import { ResponseSavedPostListDto } from './response-saved-post-list.dto';

export class PagingMetaDto {
	@ApiProperty({ example: '20' })
	total: number;

	@ApiProperty({ example: '1' })
	page: number;

	@ApiProperty({ example: '10' })
	limit: number;
}

// Không thể dùng generic với Swagger, nên cần tạo class cụ thể nếu muốn mô tả được `data` type
export class PaginatedSavedPostListDto {
	@ApiProperty({ example: 'Lấy danh sách lưu bài viết thành công' })
	message: string;

	@ApiProperty({ type: [ResponseSavedPostListDto] })
	data: ResponseSavedPostListDto[];

	@ApiProperty({ type: PagingMetaDto })
	meta: PagingMetaDto;
}
