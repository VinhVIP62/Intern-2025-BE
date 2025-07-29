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
import {
	EventStatus,
	OrganizerType,
	RSVPStatus,
	EventInvitationStatus,
} from '@modules/event/entities/event.enum';
import { SportType } from '@modules/user/enums/user.enum';
import { BasePaginationMetaDto } from '@common/dto/base-pagination.dto';
import { EventLocationDto } from '@modules/event/dto/event.dto';

// DTO for group admin information
export class GroupAdminDto {
	@ApiProperty({ description: 'ID của admin' })
	_id: string;

	@ApiProperty({ description: 'Tên đầu của admin' })
	firstName: string;

	@ApiProperty({ description: 'Tên cuối của admin' })
	lastName: string;

	@ApiProperty({ description: 'Tên đầy đủ của admin' })
	fullName: string;

	@ApiProperty({ description: 'Ảnh đại diện của admin', required: false })
	avatar?: string;
}

// Enhanced organizer DTO that can be either User or Group
export class EventOrganizerDto {
	@ApiProperty({ description: 'ID của organizer' })
	_id: string;

	@ApiProperty({ description: 'Tên đầu (cho User) hoặc tên nhóm (cho Group)', required: false })
	firstName?: string;

	@ApiProperty({ description: 'Tên cuối (cho User)', required: false })
	lastName?: string;

	@ApiProperty({ description: 'Tên đầy đủ (cho User) hoặc tên nhóm (cho Group)' })
	fullName?: string;

	@ApiProperty({ description: 'Tên nhóm (cho Group)', required: false })
	name?: string;

	@ApiProperty({ description: 'Mô tả (cho Group)', required: false })
	description?: string;

	@ApiProperty({ description: 'Ảnh đại diện', required: false })
	avatar?: string;

	@ApiProperty({
		type: [GroupAdminDto],
		description: 'Danh sách admin của nhóm (chỉ có khi organizerType là GROUP)',
		required: false,
	})
	admins?: GroupAdminDto[];
}

export class EventResponseDto {
	@ApiProperty({ description: 'ID sự kiện' })
	_id: string;

	@ApiProperty({ description: 'Tiêu đề sự kiện' })
	title: string;

	@ApiProperty({ description: 'Mô tả', required: false })
	description?: string;

	@ApiProperty({ description: 'Ảnh sự kiện', required: false })
	image?: string;

	@ApiProperty({
		type: EventOrganizerDto,
		description:
			'Thông tin người tổ chức (User hoặc Group). Nếu là Group, sẽ bao gồm danh sách admin.',
	})
	organizer: EventOrganizerDto;

	@ApiProperty({
		enum: OrganizerType,
		description:
			'Loại organizer: User hoặc Group. Nếu là Group, organizer sẽ bao gồm danh sách admin.',
	})
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

export class SimpleEventResponseDto {
	@ApiProperty({ description: 'ID sự kiện' })
	_id: string;

	@ApiProperty({ description: 'Tiêu đề sự kiện' })
	title: string;

	@ApiProperty({ description: 'Mô tả', required: false })
	description?: string;

	@ApiProperty({ description: 'Ảnh sự kiện', required: false })
	image?: string;

	@ApiProperty({ enum: SportType, description: 'Môn thể thao' })
	sport: SportType;

	@ApiProperty({ enum: EventStatus, description: 'Trạng thái sự kiện' })
	status: EventStatus;

	@ApiProperty({
		enum: RSVPStatus,
		description: 'Trạng thái RSVP của user cho sự kiện này',
		required: false,
		example: 'going',
	})
	userRSVPStatus?: RSVPStatus | null;
}

export class PaginatedSimpleEventsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({
		type: [SimpleEventResponseDto],
		description: 'Danh sách sự kiện với thông tin cơ bản',
	})
	events: SimpleEventResponseDto[];
}

export class UserEventResponseDto extends EventResponseDto {
	@ApiProperty({
		enum: RSVPStatus,
		description: 'Trạng thái RSVP của user cho sự kiện này',
		required: false,
		example: 'going',
	})
	userRSVPStatus?: RSVPStatus | null;
}

export class PaginatedUserEventsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({
		type: [UserEventResponseDto],
		description: 'Danh sách sự kiện của user với thông tin RSVP status',
	})
	events: UserEventResponseDto[];
}
