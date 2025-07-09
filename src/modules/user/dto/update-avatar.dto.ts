import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAvatarDto {
	@ApiProperty({ description: 'Link avatar người dùng', example: 'avatar/141user.jpg' })
	@IsNotEmpty({ message: 'validation.user.avatarUrl.required' })
	@IsString({ message: 'validation.user.avatarUrl.invalid' })
	avatarUrl: string;
}
