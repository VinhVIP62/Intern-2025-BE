import { SportResponseDto } from '@modules/sport/dto/sports-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude, Type, Transform } from 'class-transformer';
import { Types } from 'mongoose';

class SportLevelDto {
	@ApiProperty({ type: String, description: 'ID môn thể thao (Sport)' })
	@Expose()
	@Type(() => SportResponseDto)
	sport: SportResponseDto;

	@ApiProperty({
		enum: ['beginner', 'intermediate', 'advanced'],
		description: 'Cấp độ trình độ môn thể thao',
	})
	@Expose()
	level: 'beginner' | 'intermediate' | 'advanced';
}

class LocationDto {
	@ApiProperty({ description: 'Tọa độ vị trí [longitude, latitude]' })
	@Expose()
	coordinates: [number, number];

	@ApiProperty({ description: 'Địa chỉ cụ thể' })
	@Expose()
	address: string;

	@ApiProperty({ description: 'Thành phố' })
	@Expose()
	city: string;

	@ApiProperty({ description: 'Quận/huyện' })
	@Expose()
	district: string;
}

export type FriendRequestStatus = 'friend' | 'incoming_request' | 'outgoing_request' | 'none';

export class ResponseUserDto {
	@ApiProperty({ description: 'ID của người dùng' })
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty({ description: 'Email người dùng' })
	@Expose()
	email: string;

	@ApiProperty({ description: 'Họ và tên người dùng', required: false })
	@Expose()
	fullName?: string;

	@ApiProperty({ description: 'Giới tính', enum: ['male', 'female', 'other'], required: false })
	@Expose()
	gender?: 'male' | 'female' | 'other';

	@ApiProperty({ description: 'Ngày sinh', type: String, format: 'date', required: false })
	@Expose()
	dateOfBirth?: Date;

	@ApiProperty({ description: 'Ảnh đại diện', required: false })
	@Expose()
	avatarUrl?: string;

	@ApiProperty({ type: LocationDto, required: false })
	@Expose()
	@Type(() => LocationDto)
	location?: LocationDto;

	@ApiProperty({ type: [SportLevelDto], required: false })
	@Expose()
	@Type(() => SportLevelDto)
	sports?: SportLevelDto[];

	@ApiProperty({ enum: ['google', null], required: false })
	@Expose()
	oauthProvider?: string;

	@ApiProperty({ description: 'Danh sách quyền người dùng (USER, ADMIN...)' })
	@Expose()
	roles: string[];

	@ApiProperty({ type: Boolean, description: 'Có phải bạn bè không', required: false })
	isFriend?: boolean;

	@ApiProperty({
		enum: ['friend', 'incoming_request', 'outgoing_request', 'none'],
		description: 'Trạng thái request',
		required: false,
	})
	friendRequestStatus?: FriendRequestStatus;

	@ApiProperty({ description: 'Ngày tạo', type: String, format: 'date-time' })
	@Expose()
	createdAt: Date;

	@ApiProperty({ description: 'Ngày cập nhật', type: String, format: 'date-time' })
	@Expose()
	updatedAt: Date;

	@Exclude()
	password: string;
}
