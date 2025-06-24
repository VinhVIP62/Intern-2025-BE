import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDate, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityLevel, SportType } from '../enums/user.enum';

export class LocationDto {
	@ApiProperty({ description: 'Thành phố', required: false })
	@IsOptional()
	@IsString()
	city?: string;

	@ApiProperty({ description: 'Quận/Huyện', required: false })
	@IsOptional()
	@IsString()
	district?: string;

	@ApiProperty({ description: 'Địa chỉ chi tiết', required: false })
	@IsOptional()
	@IsString()
	address?: string;
}

export class UpdateProfileDto {
	@ApiProperty({ description: 'Tên', required: false })
	@IsOptional()
	@IsString()
	firstName?: string;

	@ApiProperty({ description: 'Họ', required: false })
	@IsOptional()
	@IsString()
	lastName?: string;

	@ApiProperty({ description: 'Ảnh đại diện', required: false })
	@IsOptional()
	@IsString()
	avatar?: string;

	@ApiProperty({ description: 'Ảnh bìa', required: false })
	@IsOptional()
	@IsString()
	coverImage?: string;

	@ApiProperty({ description: 'Tiểu sử', required: false })
	@IsOptional()
	@IsString()
	bio?: string;

	@ApiProperty({ description: 'Ngày sinh', required: false })
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	dateOfBirth?: Date;

	@ApiProperty({ description: 'Số điện thoại', required: false })
	@IsOptional()
	@IsString()
	phone?: string;

	@ApiProperty({ description: 'Địa chỉ', required: false })
	@IsOptional()
	@ValidateNested()
	@Type(() => LocationDto)
	location?: LocationDto;

	@ApiProperty({ description: 'Các môn thể thao yêu thích', isArray: true, required: false })
	@IsOptional()
	@IsArray()
	@IsEnum(SportType, { each: true })
	favoritesSports?: SportType[];

	@ApiProperty({ description: 'Mức độ kỹ năng', required: false })
	@IsOptional()
	skillLevels?: Map<SportType, ActivityLevel>;
}
