import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../type/notification-type.enum';
// import { NotificationMetaModel } from '../type/notification-meta-model.enum';

export class CreateNotificationDto {
	@ApiProperty({
		description: 'ID người nhận thông báo',
		example: '665a7e1e81ab123456789012',
	})
	@IsMongoId()
	actor: string;

	@ApiProperty({
		description: 'ID người nhận thông báo',
		example: '665a7e1e81ab123456789012',
	})
	@IsMongoId()
	receiver: string;

	@ApiProperty({
		description: 'Loại thông báo',
		enum: NotificationType,
		example: NotificationType.Comment,
	})
	@IsEnum(NotificationType)
	type: NotificationType;

	@ApiPropertyOptional({
		description: 'Tiêu đề thông báo (nếu có)',
		example: 'Bạn có tin nhắn mới',
	})
	@IsOptional()
	@IsString()
	title?: string;

	@ApiPropertyOptional({
		description: 'Nội dung chi tiết của thông báo (nếu có)',
		example: 'Nguyễn Văn A đã gửi cho bạn một tin nhắn',
	})
	@IsOptional()
	@IsString()
	content?: string;

	@ApiPropertyOptional({
		description: 'ID tham chiếu đến tài nguyên liên quan (post, message, user...)',
		example: '665b1e1f81ab1234567890ef',
	})
	@IsOptional()
	@IsMongoId()
	metaRef?: string;

	@ApiPropertyOptional({
		description: 'Model của metaRef tương ứng (để refPath hoạt động)',
		example: 'Post', // hoặc 'Message', 'User' tùy loại
	})
	@IsOptional()
	@IsString()
	metaModel?: string;
}
