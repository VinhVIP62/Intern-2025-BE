import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';
import {
	IsString,
	IsOptional,
	IsEnum,
	IsMongoId,
	IsDate,
	IsInt,
	Min,
	Max,
	IsArray,
	ValidateNested,
	IsObject,
	IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, OrganizerType } from '@modules/event/entities/event.enum';
import { SportType } from '@modules/user/enums/user.enum';
import { BasePaginationMetaDto } from '@common/dto/base-pagination.dto';
import { EventLocationDto } from '@modules/event/dto/event.dto';

export class EventResponseDto {
	@ApiProperty({ description: 'ID sự kiện' })
	_id: string;

	@ApiProperty({ description: 'Tiêu đề sự kiện' })
	title: string;

	@ApiProperty({ description: 'Mô tả', required: false })
	description?: string;

	@ApiProperty({ description: 'Ảnh sự kiện', required: false })
	image?: string;

	@ApiProperty({ description: 'ID người tổ chức' })
	organizer: Types.ObjectId;

	@ApiProperty({ enum: OrganizerType, description: 'Loại organizer' })
	organizerType: OrganizerType;

	@ApiProperty({ enum: SportType, description: 'Môn thể thao' })
	sport: SportType;

	@ApiProperty({ description: 'Thời gian bắt đầu' })
	startDate: Date;

	@ApiProperty({ description: 'Thời gian kết thúc' })
	endDate: Date;

	@ApiProperty({ type: EventLocationDto, description: 'Địa điểm' })
	location: EventLocationDto;

	@ApiProperty({ description: 'Số lượng tham gia tối thiểu', required: false })
	minParticipants?: number;

	@ApiProperty({ description: 'Số lượng tham gia tối đa' })
	maxParticipants: number;

	@ApiProperty({ type: [Types.ObjectId], description: 'Danh sách người tham gia', required: false })
	participants?: Types.ObjectId[];

	@ApiProperty({ enum: EventStatus, description: 'Trạng thái sự kiện' })
	status: EventStatus;

	@ApiProperty({ description: 'Số lượng người tham gia', required: false })
	participantCount?: number;

	@ApiProperty({ description: 'Thời gian tạo', required: false })
	createdAt?: Date;

	@ApiProperty({ description: 'Thời gian cập nhật', required: false })
	updatedAt?: Date;

	// Virtual fields
	@ApiProperty({ description: 'Thông tin người tổ chức', required: false })
	organizerUser?: any;

	@ApiProperty({ description: 'Danh sách thông tin người tham gia', required: false })
	participantUsers?: any[];
}

export class PaginatedEventsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({ type: [EventResponseDto], description: 'Danh sách sự kiện' })
	events: EventResponseDto[];
}

export class EventParticipantDto {
	@ApiProperty({ description: 'ID người dùng' })
	@IsMongoId()
	userId: string;

	@ApiProperty({ description: 'Tên người dùng' })
	@IsString()
	fullName: string;

	@ApiProperty({ description: 'Ảnh đại diện', required: false })
	@IsOptional()
	@IsString()
	avatar?: string;
}

export class PaginatedEventParticipantsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({ type: [EventParticipantDto], description: 'Danh sách người tham gia sự kiện' })
	participants: EventParticipantDto[];
}

// ===== INVITATION, NEARBY, USER EVENTS DTOs =====

export class InviteUsersToEventDto {
	@ApiProperty({ type: [String], description: 'Danh sách userId được mời' })
	@IsArray()
	@IsMongoId({ each: true })
	userIds: string[];
}

export class EventInvitationResponseDto {
	@ApiProperty({ description: 'ID lời mời' })
	@IsString()
	invitationId: string;

	@ApiProperty({ description: 'ID sự kiện' })
	@IsMongoId()
	eventId: string;

	@ApiProperty({ description: 'ID người gửi' })
	@IsMongoId()
	senderId: string;

	@ApiProperty({ description: 'ID người nhận' })
	@IsMongoId()
	recipientId: string;

	@ApiProperty({ type: EventResponseDto, description: 'Thông tin sự kiện' })
	@ValidateNested()
	@Type(() => EventResponseDto)
	event: EventResponseDto;

	@ApiProperty({ description: 'Trạng thái lời mời', example: 'pending' })
	@IsString()
	status: string;

	@ApiProperty({ description: 'Thời gian tạo' })
	@IsString()
	createdAt: string;
}

export class PaginatedEventInvitationsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({ type: [EventInvitationResponseDto], description: 'Danh sách lời mời sự kiện' })
	invitations: EventInvitationResponseDto[];
}

export class PaginatedNearbyEventsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({ type: [EventResponseDto], description: 'Danh sách sự kiện gần đây' })
	events: EventResponseDto[];
}

export class PaginatedUserEventsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({ type: [EventResponseDto], description: 'Danh sách sự kiện của user' })
	events: EventResponseDto[];
}
