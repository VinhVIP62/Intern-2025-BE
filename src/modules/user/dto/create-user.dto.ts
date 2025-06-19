import { Role } from '@common/enum/roles.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsArray,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsDateString,
	IsBoolean,
	IsObject,
	IsPhoneNumber,
	IsStrongPassword,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SportType, ActivityLevel } from '../enums/user.enum';

class LocationDto {
	@ApiPropertyOptional({ example: 'Hanoi' })
	@IsOptional()
	@IsString()
	city?: string;

	@ApiPropertyOptional({ example: 'Cau Giay' })
	@IsOptional()
	@IsString()
	district?: string;

	@ApiPropertyOptional({ example: '123 Main St' })
	@IsOptional()
	@IsString()
	address?: string;
}

export class CreateUserDto {
	@ApiProperty({ description: 'Email của người dùng', example: 'johndoe@example.com' })
	@IsNotEmpty({ message: 'Email is required' })
	@IsEmail()
	email: string;

	@ApiProperty({
		description: 'Mật khẩu mạnh (tối thiểu 8 ký tự, 1 số, 1 chữ in hoa, 1 ký tự đặc biệt)',
		example: 'StrongP@ssw0rd',
	})
	@IsStrongPassword()
	password: string;

	@ApiPropertyOptional({ description: 'Refresh Token', example: '...' })
	@IsOptional()
	@IsString()
	refToken?: string;

	@ApiPropertyOptional({ description: 'Tên', example: 'John' })
	@IsOptional()
	@IsString()
	firstName?: string;

	@ApiPropertyOptional({ description: 'Họ', example: 'Doe' })
	@IsOptional()
	@IsString()
	lastName?: string;

	@ApiPropertyOptional({ description: 'Avatar URL', example: 'https://...' })
	@IsOptional()
	@IsString()
	avatar?: string;

	@ApiPropertyOptional({ description: 'Cover Image URL', example: 'https://...' })
	@IsOptional()
	@IsString()
	coverImage?: string;

	@ApiPropertyOptional({ description: 'Bio', example: 'I love sports!' })
	@IsOptional()
	@IsString()
	bio?: string;

	@ApiPropertyOptional({ description: 'Ngày sinh', example: '2000-01-01' })
	@IsOptional()
	@IsDateString()
	dateOfBirth?: Date;

	@ApiPropertyOptional({ description: 'Số điện thoại', example: '+84987654321' })
	@IsOptional()
	@IsString()
	phone?: string;

	@ApiPropertyOptional({ description: 'Địa chỉ', type: LocationDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => LocationDto)
	location?: LocationDto;

	@ApiPropertyOptional({
		description: 'Danh sách môn thể thao yêu thích',
		isArray: true,
		enum: SportType,
	})
	@IsOptional()
	@IsArray()
	@IsEnum(SportType, { each: true })
	favoritesSports?: SportType[];

	@ApiPropertyOptional({
		description: 'Trình độ kỹ năng theo môn thể thao',
		type: 'object',
		example: { football: 'beginner', tennis: 'advanced' },
		additionalProperties: { type: 'string', enum: Object.values(ActivityLevel) },
	})
	@IsOptional()
	@IsObject()
	skillLevels?: Record<string, ActivityLevel>;

	@ApiPropertyOptional({ description: 'Danh sách bạn bè', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	friends?: string[];

	@ApiPropertyOptional({ description: 'Danh sách đang theo dõi', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	following?: string[];

	@ApiPropertyOptional({ description: 'Danh sách người theo dõi', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	followers?: string[];

	@ApiPropertyOptional({ description: 'Danh sách nhóm đã tham gia', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	joinedGroups?: string[];

	@ApiPropertyOptional({ description: 'Trạng thái hoạt động', example: true })
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@ApiPropertyOptional({ description: 'Đã xác thực email', example: false })
	@IsOptional()
	@IsBoolean()
	isVerified?: boolean;

	@ApiPropertyOptional({
		description: 'Danh sách role (ADMIN, MODERATOR, USER)',
		isArray: true,
		enum: Role,
	})
	@IsArray()
	@IsEnum(Role, { each: true })
	@IsOptional()
	roles?: Role[];
}
