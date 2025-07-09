import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsEnum, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class SportLevelInputDto {
	@ApiPropertyOptional({ type: String, description: 'ID môn thể thao (Sport)' })
	@IsMongoId({ message: 'validation.user.sports.sport.invalid' })
	sport: Types.ObjectId;

	@ApiPropertyOptional({
		enum: ['beginner', 'intermediate', 'advanced'],
		description: 'Cấp độ trình độ môn thể thao',
	})
	@IsEnum(['beginner', 'intermediate', 'advanced'], {
		message: 'validation.user.sports.level.invalid',
	})
	level: 'beginner' | 'intermediate' | 'advanced';
}

export class UpdateUserDto {
	@ApiPropertyOptional({ description: 'Tên người dùng', example: 'Nguyễn văn An' })
	@IsOptional()
	@IsString({ message: 'validation.user.fullName.invalid' })
	fullName?: string;

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
		description: 'Danh sách môn thể thao với cấp độ',
		type: [SportLevelInputDto],
		example: [
			{ sport: '665a7e1e81ab123456789012', level: 'advanced' },
			{ sport: '665a8f1e81ab123456789099', level: 'beginner' },
		],
	})
	@IsOptional()
	@IsArray({ message: 'validation.user.sports.invalid' })
	@ValidateNested({ each: true })
	@Type(() => SportLevelInputDto)
	sports?: SportLevelInputDto[];
}
