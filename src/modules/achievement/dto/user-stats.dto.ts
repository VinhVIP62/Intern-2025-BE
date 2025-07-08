import { IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
	@ApiProperty({ example: true, description: 'User đã hoàn thành hồ sơ cá nhân' })
	@IsBoolean()
	completeProfile: boolean;

	@ApiProperty({ example: true, description: 'User đã tham gia nhóm thể thao đầu tiên' })
	@IsBoolean()
	joinFirstGroup: boolean;

	@ApiProperty({ example: 7, description: 'Số ngày đăng nhập liên tục' })
	@IsInt()
	@Min(0)
	loginStreak: number;

	@ApiProperty({ example: 10, description: 'Số lượng bạn bè hiện tại của user' })
	@IsInt()
	@Min(0)
	friendCount: number;

	@ApiProperty({ example: 1, description: 'Số sự kiện user đã tạo' })
	@IsInt()
	@Min(0)
	createEvent: number;

	@ApiProperty({ example: 5, description: 'Số sự kiện user đã tham gia' })
	@IsInt()
	@Min(0)
	joinEvent: number;

	@ApiProperty({ example: 3, description: 'Số bài viết user đã đăng về hoạt động thể thao' })
	@IsInt()
	@Min(0)
	postCount: number;
}
