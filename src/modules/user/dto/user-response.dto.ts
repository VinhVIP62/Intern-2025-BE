import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class ResponseUserDto {
	@ApiProperty({ description: 'ID của người dùng' })
	@Expose()
	_id: string;

	@ApiProperty({ description: 'Tên đăng nhập' })
	@Expose()
	username: string;

	@ApiProperty({ description: 'Mật khẩu' })
	@Exclude()
	password: string;

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
}
