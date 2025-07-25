import { IsString, IsEnum, IsOptional, IsArray, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, ReferenceModel } from '@modules/notification/entities/notification.enum';
import { BasePaginatedResponseDto, BasePaginationMetaDto } from '@common/dto/base-pagination.dto';

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

	@ApiProperty({ type: Number, description: 'Số lượng thông báo chưa đọc' })
	unreadCount: number;
}
