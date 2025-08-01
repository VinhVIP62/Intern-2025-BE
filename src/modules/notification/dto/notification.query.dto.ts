import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class NotificationQueryDto {
	@ApiProperty({ required: false, description: 'Filter notifications by type' })
	@IsOptional()
	@IsIn(['event', 'friend'])
	type: string;

	@ApiProperty({ required: false, description: 'Page number for pagination' })
	@IsOptional()
	@IsNumber()
	@Min(1)
	page: number = 1;

	@ApiProperty({ required: false, description: 'Number of notifications per page' })
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(20)
	limit: number = 10;
}
