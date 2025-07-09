import { ApiProperty } from '@nestjs/swagger';

export class AchievementProgressDto {
	@ApiProperty({ description: 'ID của achievement' })
	achievementId: string;

	@ApiProperty({ description: 'Tiến trình đạt được', required: false })
	progress?: number;
}
