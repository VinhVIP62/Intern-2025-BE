import { IsString, IsEnum, IsOptional, IsArray, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, ReferenceModel } from '../entities/notification.enum';
import { BasePaginatedResponseDto, BasePaginationMetaDto } from '@common/dto/base-pagination.dto';

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

export class NotificationRelatedUserDto {
	@ApiProperty({ type: String })
	_id: string;
	@ApiProperty()
	name: string;
	@ApiProperty({ required: false })
	avatar?: string;
}

export class NotificationRelatedGroupDto {
	@ApiProperty({ type: String })
	_id: string;
	@ApiProperty()
	name: string;
	@ApiProperty({ required: false })
	avatar?: string;
}

export class NotificationRelatedEventDto {
	@ApiProperty({ type: String })
	_id: string;
	@ApiProperty()
	name: string;
	@ApiProperty({ required: false })
	avatar?: string;
}

export class NotificationRelatedPostDto {
	@ApiProperty({ type: String })
	_id: string;
	@ApiProperty()
	title: string;
}

export class NotificationRelatedCommentDto {
	@ApiProperty({ type: String })
	_id: string;
	@ApiProperty()
	content: string;
}

export class NotificationResponseDto {
	@ApiProperty({ type: String })
	_id: string;

	@ApiProperty({ enum: NotificationType })
	type: NotificationType;

	@ApiProperty()
	message: string;

	@ApiProperty()
	isRead: boolean;

	@ApiProperty()
	isActive: boolean;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiPropertyOptional({ type: NotificationRelatedUserDto })
	sender?: NotificationRelatedUserDto;

	@ApiPropertyOptional({ type: NotificationRelatedUserDto })
	recipient?: NotificationRelatedUserDto;

	@ApiPropertyOptional({ type: NotificationRelatedGroupDto })
	group?: NotificationRelatedGroupDto;

	@ApiPropertyOptional({ type: NotificationRelatedEventDto })
	event?: NotificationRelatedEventDto;

	@ApiPropertyOptional({ type: NotificationRelatedPostDto })
	post?: NotificationRelatedPostDto;

	@ApiPropertyOptional({ type: NotificationRelatedCommentDto })
	comment?: NotificationRelatedCommentDto;
}

export class NotificationPaginationResponseDto extends BasePaginationMetaDto {
	@ApiProperty({ type: [NotificationResponseDto] })
	notifications: NotificationResponseDto[];
}
