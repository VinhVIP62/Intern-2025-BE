import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class ResponseUserDto {
	@ApiProperty({ description: 'ID của người dùng' })
	@Expose()
	_id: string;

	@ApiProperty({ description: 'Danh sách email', type: [String], required: false })
	@Expose()
	emails?: string[];

	@ApiProperty({ description: 'Danh sách số điện thoại', type: [String], required: false })
	@Expose()
	phoneNumbers?: string[];

	@ApiProperty({ description: 'Họ và tên', required: false })
	@Expose()
	fullName?: string;

	@ApiProperty({ description: 'Ngày sinh', type: String, format: 'date', required: false })
	@Expose()
	birthday?: Date;

	@ApiProperty({ description: 'Giới tính', enum: ['male', 'female'], required: true })
	@Expose()
	gender: string;

	@ApiProperty({ description: 'Avatar URL', required: false })
	@Expose()
	avatar?: string | null;

	@ApiProperty({ description: 'Mật khẩu - KHÔNG BAO GIỜ TRẢ VỀ' })
	@Exclude()
	password?: string;

	@ApiProperty({ description: 'External ID (Google, Facebook...)', required: false })
	@Exclude()
	externalId?: string;

	@ApiProperty({ description: 'External type (google, facebook...)', required: false })
	@Exclude()
	externalType?: string;

	@ApiProperty({
		description: 'Các role của người dùng',
		isArray: true,
		example: ['USER', 'ADMIN'],
	})
	@Expose()
	roles: string[];

	@ApiProperty({ description: 'Ngày tạo', type: String, format: 'date-time', required: false })
	@Expose()
	createdAt?: Date;

	@ApiProperty({ description: 'Ngày cập nhật', type: String, format: 'date-time', required: false })
	@Expose()
	updatedAt?: Date;

	@ApiProperty({ description: 'Background URL', required: true })
	@Expose()
	background?: string | null;

	@ApiProperty({ description: 'Mô tả', required: true })
	@Expose()
	description?: string | null;
}
