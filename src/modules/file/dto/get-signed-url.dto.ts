import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetSignedUrlDto {
	@ApiProperty({
		description: 'Tên thư mục trên cloud (ví dụ: avatars, posts, ...)',
		example: 'avatars',
	})
	@IsString({ message: 'validation.common.string' })
	@IsNotEmpty({ message: 'validation.common.required' })
	folder: string;

	@ApiProperty({
		description: 'Tên file sẽ được upload (bao gồm phần mở rộng)',
		example: 'user123.png',
	})
	@IsString({ message: 'validation.common.string' })
	@IsNotEmpty({ message: 'validation.common.required' })
	filename: string;

	@ApiProperty({
		description: 'Kiểu MIME của file (ví dụ: image/png, image/jpeg)',
		example: 'image/png',
	})
	@IsString({ message: 'validation.common.string' })
	@IsNotEmpty({ message: 'validation.common.required' })
	mimetype: string;
}
