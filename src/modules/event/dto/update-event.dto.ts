import {
	IsString,
	IsOptional,
	IsArray,
	IsDateString,
	IsBoolean,
	IsMongoId,
	Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventDto {
	@ApiPropertyOptional({ description: 'Tiêu đề sự kiện', example: 'Giao lưu đá bóng sáng thứ 7' })
	@IsString()
	@IsOptional()
	title?: string;

	@ApiPropertyOptional({ description: 'Mô tả sự kiện', example: 'Tham gia đá bóng cùng anh em' })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({ description: 'Danh sách URL hình ảnh sự kiện', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	imageUrls?: string[];

	@ApiPropertyOptional({ description: 'ID môn thể thao', example: '665a7e1e81ab123456789012' })
	@IsOptional()
	@IsMongoId()
	sport?: string;

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
		description: 'Thời gian diễn ra sự kiện',
		example: '2025-07-09T08:30:00.000Z',
	})
	@IsDateString()
	@IsOptional()
	time: string;

	@ApiPropertyOptional({ description: 'Số lượng người tham gia tối đa', minimum: 2, example: 10 })
	@Min(2)
	@IsOptional()
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
