import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ActivityLevel, SportType } from '../enums/user.enum';

export class ResponseProfileDto {
	@ApiProperty({ description: 'ID của người dùng' })
	@Expose()
	_id: string;

	@ApiProperty({ description: 'Email của người dùng' })
	@Expose()
	email: string;

	@ApiProperty({ description: 'Tên' })
	@Expose()
	firstName: string;

	@ApiProperty({ description: 'Họ' })
	@Expose()
	lastName: string;

	@ApiProperty({ description: 'Tên đầy đủ' })
	@Expose()
	fullName: string;

	@ApiProperty({ description: 'Ảnh đại diện', required: false })
	@Expose()
	avatar?: string;

	@ApiProperty({ description: 'Ảnh bìa', required: false })
	@Expose()
	coverImage?: string;

	@ApiProperty({ description: 'Tiểu sử', required: false })
	@Expose()
	bio?: string;

	@ApiProperty({ description: 'Ngày sinh', required: false })
	@Expose()
	dateOfBirth?: Date;

	@ApiProperty({ description: 'Số điện thoại', required: false })
	@Expose()
	phone?: string;

	@ApiProperty({ description: 'Địa chỉ', required: false })
	@Expose()
	location?: {
		city: string;
		district: string;
		address: string;
	};

	@ApiProperty({ description: 'Các môn thể thao yêu thích', isArray: true, required: false })
	@Expose()
	favoritesSports?: SportType[];

	@ApiProperty({ description: 'Mức độ kỹ năng', required: false })
	@Expose()
	skillLevels?: Map<SportType, ActivityLevel>;

	@ApiProperty({ description: 'Số lượng bạn bè' })
	@Expose()
	friendsCount: number;

	@ApiProperty({ description: 'Số lượng đang theo dõi' })
	@Expose()
	followingCount: number;

	@ApiProperty({ description: 'Số lượng người theo dõi' })
	@Expose()
	followersCount: number;

	@ApiProperty({ description: 'Số lượng nhóm đã tham gia' })
	@Expose()
	joinedGroupsCount: number;

	@ApiProperty({ description: 'Trạng thái hoạt động' })
	@Expose()
	isActive: boolean;

	@ApiProperty({ description: 'Trạng thái xác thực' })
	@Expose()
	isVerified: boolean;

	@ApiProperty({ description: 'Vai trò', isArray: true })
	@Expose()
	roles: string[];

	@ApiProperty({ description: 'Ngày tạo' })
	@Expose()
	createdAt: Date;

	@ApiProperty({ description: 'Ngày cập nhật' })
	@Expose()
	updatedAt: Date;
}
