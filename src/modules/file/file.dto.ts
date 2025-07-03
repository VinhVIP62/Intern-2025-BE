import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

// DTO for delete files request
export class DeleteFilesDto {
	@ApiProperty({
		description: 'Array of Cloudinary URLs to delete',
		example: [
			'https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg',
			'https://res.cloudinary.com/cloud_name/video/upload/v1234567890/folder/video.mp4',
		],
		type: [String],
	})
	@IsArray()
	@ArrayMinSize(1, { message: 'At least one URL must be provided' })
	@IsString({ each: true, message: 'Each URL must be a string' })
	urls: string[];
}
