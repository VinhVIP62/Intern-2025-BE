import { IsString, IsEnum, IsOptional, IsArray, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, ReferenceModel } from '@modules/notification/entities/notification.enum';

export class CreateNotificationDto {
	@ApiProperty({ description: 'ID của người nhận thông báo' })
	@IsMongoId()
	recipient: string;

	@ApiProperty({ description: 'ID của người gửi thông báo' })
	@IsMongoId()
	sender: string;

	@ApiProperty({ description: 'Loại thông báo', enum: NotificationType })
	@IsEnum(NotificationType)
	type: NotificationType;

	@ApiProperty({ description: 'Nội dung thông báo' })
	@IsString()
	message: string;

	@ApiPropertyOptional({ description: 'ID của document được reference' })
	@IsOptional()
	@IsMongoId()
	referenceId?: string;

	@ApiPropertyOptional({ description: 'Model được reference', enum: ReferenceModel })
	@IsOptional()
	@IsEnum(ReferenceModel)
	referenceModel?: ReferenceModel;

	@ApiPropertyOptional({ description: 'Danh sách ID của các user liên quan đến thông báo' })
	@IsOptional()
	@IsArray()
	@IsMongoId({ each: true })
	relatedUsers?: string[];
}
