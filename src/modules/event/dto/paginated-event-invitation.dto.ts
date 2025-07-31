import { ApiProperty } from '@nestjs/swagger';
import { EventInvitationItemDto } from './response-event-invitation.dto';

export class PagingMetaDto {
	@ApiProperty({ example: '20' })
	total: number;

	@ApiProperty({ example: '1' })
	page: number;

	@ApiProperty({ example: '10' })
	limit: number;
}

// Không thể dùng generic với Swagger, nên cần tạo class cụ thể nếu muốn mô tả được `data` type
export class PaginatedEventInvitationDto {
	@ApiProperty({ example: 'Lấy danh sách yêu cầu thành công' })
	message: string;

	@ApiProperty({ type: [EventInvitationItemDto] })
	data: EventInvitationItemDto[];

	@ApiProperty({ type: PagingMetaDto })
	meta: PagingMetaDto;
}
