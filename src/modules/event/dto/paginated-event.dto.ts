import { ApiProperty } from '@nestjs/swagger';
import { ResponseEventDto } from './response-event.dto';

export class PagingMetaDto {
	@ApiProperty({ example: '20' })
	total: number;

	@ApiProperty({ example: '1' })
	page: number;

	@ApiProperty({ example: '10' })
	limit: number;
}

// Không thể dùng generic với Swagger, nên cần tạo class cụ thể nếu muốn mô tả được `data` type
export class PaginatedEventResponseDto {
	@ApiProperty({ example: 'Lấy danh sách bài viết thành công' })
	message: string;

	@ApiProperty({ type: [ResponseEventDto] })
	data: ResponseEventDto[];

	@ApiProperty({ type: PagingMetaDto })
	meta: PagingMetaDto;
}
