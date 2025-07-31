import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SavePostDto {
	@ApiProperty({ example: 'Để đọc sau', description: 'Tên danh mục lưu bài viết (tuỳ chọn)' })
	@IsNotEmpty()
	@IsString()
	name?: string;
}
