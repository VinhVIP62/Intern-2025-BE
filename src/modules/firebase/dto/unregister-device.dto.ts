import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UnregisterDeviceDto {
	@ApiProperty({
		description: 'Firebase device token cần hủy',
		example: 'dSJxleYhTfylF38...x8QweT',
	})
	@IsString()
	@IsNotEmpty()
	token: string;
}
