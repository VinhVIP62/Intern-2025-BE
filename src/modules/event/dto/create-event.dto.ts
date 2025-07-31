import {
	IsString,
	IsNotEmpty,
	IsOptional,
	IsArray,
	IsDateString,
	IsBoolean,
	IsMongoId,
	Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
	@ApiProperty({ description: 'Tiêu đề sự kiện', example: 'Giao lưu đá bóng sáng thứ 7' })
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiPropertyOptional({ description: 'Mô tả sự kiện', example: 'Tham gia đá bóng cùng anh em' })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({ description: 'Danh sách URL hình ảnh sự kiện', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	imageUrls?: string[];

	@ApiPropertyOptional({
		description: 'Danh sách ID môn thể thao',
		example: ['665a7e1e81ab123456789012', '665a7e1e81ab123456789013'],
		type: [String],
	})
	@IsOptional()
	@IsMongoId({ each: true })
	sports?: string[];

	@ApiPropertyOptional({
		description: 'Địa chỉ người dùng (tọa độ + thông tin)',
		example: {
			coordinates: [106.660172, 10.762622],
			address: '123 Lê Lợi, Quận 1',
			city: 'Hồ Chí Minh',
			district: 'Quận 1',
		},
	})
	@IsOptional()
	location?: {
		type: 'Point';
		coordinates: [number, number];
		address: string;
		city: string;
		district: string;
	};

	@ApiPropertyOptional({
		description: 'Danh sách ID của bạn bè được gắn thẻ',
		type: [String],
		example: ['60d21b4667d0d8992e610c85', '60d21b4967d0d8992e610c86'],
	})
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	taggedFriends?: string[];

	@ApiProperty({ description: 'Thời gian diễn ra sự kiện', example: '2025-07-09T08:30:00.000Z' })
	@IsDateString()
	time: string;

	@ApiProperty({ description: 'Số lượng người tham gia tối đa', minimum: 2, example: 10 })
	@Min(2)
	maxParticipants: number;

	@ApiPropertyOptional({ description: 'Sự kiện công khai hay riêng tư', default: true })
	@IsOptional()
	@IsBoolean()
	isPublic?: boolean;

	@ApiPropertyOptional({ description: 'Có cần phê duyệt khi tham gia không', default: false })
	@IsOptional()
	@IsBoolean()
	requiresApproval?: boolean;
}
