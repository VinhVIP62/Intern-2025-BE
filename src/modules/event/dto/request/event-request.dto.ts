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
	EventInvitationStatus,
	EventStatus,
	OrganizerType,
	RSVPStatus,
} from '@modules/event/entities/event.enum';
import { SportType } from '@modules/user/enums/user.enum';
import { BasePaginationMetaDto } from '@common/dto/base-pagination.dto';
import { EventLocationDto } from '../event.dto';

export class CreateEventDto {
	@ApiProperty({ description: 'Tiêu đề sự kiện' })
	@IsString()
	title: string;

	@ApiProperty({ description: 'Mô tả', required: false })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ description: 'Ảnh sự kiện', required: false })
	@IsOptional()
	@IsString()
	image?: string;

	@ApiProperty({ description: 'ID người tổ chức' })
	@IsMongoId()
	organizer: string;

	@ApiProperty({ enum: OrganizerType, description: 'Loại organizer' })
	@IsEnum(OrganizerType)
	organizerType: OrganizerType;

	@ApiProperty({ enum: SportType, description: 'Môn thể thao' })
	@IsEnum(SportType)
	sport: SportType;

	@ApiProperty({ description: 'Thời gian bắt đầu' })
	@IsString()
	startDate: string;

	@ApiProperty({ description: 'Thời gian kết thúc' })
	@IsString()
	endDate: string;

	@ApiProperty({ type: EventLocationDto, description: 'Địa điểm' })
	@ValidateNested()
	@Type(() => EventLocationDto)
	location: EventLocationDto;

	@ApiProperty({ description: 'Số lượng tham gia tối thiểu', required: false })
	@IsOptional()
	@IsInt()
	@Min(1)
	minParticipants?: number;

	@ApiProperty({ description: 'Số lượng tham gia tối đa' })
	@IsInt()
	@Min(1)
	maxParticipants: number;
}

export class UpdateEventDto {
	@ApiProperty({ description: 'Tiêu đề sự kiện', required: false })
	@IsOptional()
	@IsString()
	title?: string;

	@ApiProperty({ description: 'Mô tả', required: false })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ description: 'Ảnh sự kiện', required: false })
	@IsOptional()
	@IsString()
	image?: string;

	@ApiProperty({ description: 'ID người tổ chức', required: false })
	@IsOptional()
	@IsMongoId()
	organizer?: string;

	@ApiProperty({ enum: OrganizerType, description: 'Loại organizer', required: false })
	@IsOptional()
	@IsEnum(OrganizerType)
	organizerType?: OrganizerType;

	@ApiProperty({ enum: SportType, description: 'Môn thể thao', required: false })
	@IsOptional()
	@IsEnum(SportType)
	sport?: SportType;

	@ApiProperty({ description: 'Thời gian bắt đầu', required: false })
	@IsOptional()
	@IsString()
	startDate?: string;

	@ApiProperty({ description: 'Thời gian kết thúc', required: false })
	@IsOptional()
	@IsString()
	endDate?: string;

	@ApiProperty({ type: EventLocationDto, description: 'Địa điểm', required: false })
	@IsOptional()
	@ValidateNested()
	@Type(() => EventLocationDto)
	location?: EventLocationDto;

	@ApiProperty({ description: 'Số lượng tham gia tối thiểu', required: false })
	@IsOptional()
	@IsInt()
	@Min(1)
	minParticipants?: number;

	@ApiProperty({ description: 'Số lượng tham gia tối đa', required: false })
	@IsOptional()
	@IsInt()
	@Min(1)
	maxParticipants?: number;

	@ApiProperty({ enum: EventStatus, description: 'Trạng thái sự kiện', required: false })
	@IsOptional()
	@IsEnum(EventStatus)
	status?: EventStatus;
}

export class JoinEventDto {
	@ApiProperty({ description: 'ID sự kiện' })
	@IsMongoId()
	eventId: string;
}

export class LeaveEventDto {
	@ApiProperty({ description: 'ID sự kiện' })
	@IsMongoId()
	eventId: string;
}
