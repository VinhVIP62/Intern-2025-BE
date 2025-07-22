import { ApiProperty } from '@nestjs/swagger';
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
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, OrganizerType } from '../entities/event.enum';
import { SportType } from '@modules/user/enums/user.enum';
import { BasePaginationMetaDto } from '@common/dto/base-pagination.dto';

export class EventLocationDto {
	@ApiProperty({ description: 'Tên địa điểm' })
	@IsString()
	name: string;

	@ApiProperty({ description: 'Địa chỉ' })
	@IsString()
	address: string;

	@ApiProperty({ description: 'Thành phố' })
	@IsString()
	city: string;

	@ApiProperty({ description: 'Quận/Huyện' })
	@IsString()
	district: string;
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
