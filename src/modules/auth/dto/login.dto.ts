import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Expose()
export class LoginDto {
	@ApiProperty({ description: 'Tên đăng nhập của người dùng' })
	@IsString()
	accInput: string;

	@ApiProperty({ description: 'Mật khẩu của người dùng' })
	@IsString()
	password: string;
}
