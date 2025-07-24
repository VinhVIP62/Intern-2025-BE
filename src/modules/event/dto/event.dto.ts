import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EventLocationDto {
	@ApiProperty({ description: 'Tên địa điểm' })
	@IsString()
	name: string;

	@ApiProperty({ description: 'Địa chỉ' })
	@IsString()
	address: string;

	@ApiProperty({ description: 'Thành phố' })
	@IsString()
	city: string;

	@ApiProperty({ description: 'Quận/Huyện' })
	@IsString()
	district: string;
}
