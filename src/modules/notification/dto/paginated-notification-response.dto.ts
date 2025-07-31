import { ApiProperty } from '@nestjs/swagger';
import { ResponseNotificationDto } from './response-notification.dto';

export class PagingMetaDto {
	@ApiProperty({ example: '20' })
	total: number;

	@ApiProperty({ example: '1' })
	page: number;

	@ApiProperty({ example: '10' })
	limit: number;
}

export class PaginatedNotificationResponseDto {
	@ApiProperty({ example: 'Lấy danh sách thông báo thành công' })
	message: string;

	@ApiProperty({ type: [ResponseNotificationDto] })
	data: ResponseNotificationDto[];

	@ApiProperty({ type: PagingMetaDto })
	meta: PagingMetaDto;
}
