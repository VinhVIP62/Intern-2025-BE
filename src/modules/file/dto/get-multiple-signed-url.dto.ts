import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { GetSignedUrlDto } from './get-signed-url.dto';

export class FileInfoDto extends PickType(GetSignedUrlDto, ['filename', 'mimetype']) {}

export class GetMultipleSignedUrlDto {
	@ApiProperty({ example: 'avatars' })
	@IsString({ message: 'validation.common.string' })
	@IsNotEmpty({ message: 'validation.common.required' })
	folder: string;

	@ApiProperty({ type: [FileInfoDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => FileInfoDto)
	files: FileInfoDto[];
}
