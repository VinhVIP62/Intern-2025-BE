import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDeviceDto {
	@ApiProperty({
		description: 'Firebase device token (FCM token)',
		example: 'dSJxleYhTfylF38...x8QweT',
	})
	@IsString()
	@IsNotEmpty()
	token: string;

	@ApiProperty({
		description: 'Nền tảng thiết bị',
		example: 'android',
		enum: ['ios', 'android', 'web'],
	})
	@IsEnum(['ios', 'android', 'web'])
	platform: 'ios' | 'android' | 'web';
}
