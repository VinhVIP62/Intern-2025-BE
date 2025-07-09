import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateRespondJoinRequestDto {
	@ApiProperty({ enum: ['accepted', 'rejected'], description: 'Phản hồi yêu cầu tham gia' })
	@IsEnum(['accepted', 'rejected'], {
		message: 'Trạng thái phản hồi không hợp lệ',
	})
	status: 'accepted' | 'rejected';
}
