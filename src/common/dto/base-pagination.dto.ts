import { ApiProperty } from '@nestjs/swagger';

/**
 * Base pagination metadata DTO containing common pagination fields
 */
export class BasePaginationMetaDto {
	@ApiProperty({ description: 'Tổng số items', example: 100 })
	total: number;

	@ApiProperty({ description: 'Trang hiện tại', example: 1 })
	page: number;

	@ApiProperty({ description: 'Số lượng items trên mỗi trang', example: 10 })
	limit: number;

	@ApiProperty({ description: 'Tổng số trang', example: 10 })
	totalPages: number;

	@ApiProperty({ description: 'Có trang tiếp theo không', example: true })
	hasNextPage: boolean;

	@ApiProperty({ description: 'Có trang trước không', example: false })
	hasPrevPage: boolean;
}

/**
 * Base pagination response DTO with generic data field
 */
export class BasePaginatedResponseDto<T> extends BasePaginationMetaDto {
	@ApiProperty({ description: 'Danh sách data' })
	data: T;
}
