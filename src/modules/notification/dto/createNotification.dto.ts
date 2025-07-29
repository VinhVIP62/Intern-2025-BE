import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { NotificationType } from '@common/enum/notification/notification.type.enum';

export class CreateNotificationDto {
	@IsString()
	@IsNotEmpty()
	toUserId: string;

	@IsString()
	@IsNotEmpty()
	content: string;

	@IsOptional()
	metadata?: Record<string, any>;

	@IsEnum(NotificationType)
	@IsString()
	type: NotificationType;
}
