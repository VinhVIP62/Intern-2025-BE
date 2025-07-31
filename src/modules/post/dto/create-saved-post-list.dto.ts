import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSavedPostListDto {
	@ApiProperty({ example: 'Danh sách yêu thích', description: 'Tên danh sách lưu bài viết' })
	@IsString()
	@IsNotEmpty()
	name: string;
}
