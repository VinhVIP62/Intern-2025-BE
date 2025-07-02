import { ApiProperty } from '@nestjs/swagger';

export class UserBasicInfoDto {
	@ApiProperty({
		description: 'ID của người dùng',
		example: '685a2443342f516009019c71',
	})
	userId: string;

	@ApiProperty({
		description: 'Họ và tên đầy đủ',
		example: 'John Doe',
	})
	fullName: string;

	@ApiProperty({
		description: 'URL avatar của người dùng',
		example: 'https://example.com/avatar.jpg',
		nullable: true,
	})
	avatar: string | null;
}
