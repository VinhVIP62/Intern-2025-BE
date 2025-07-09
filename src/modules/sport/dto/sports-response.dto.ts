import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class SportResponseDto {
	@ApiProperty({ description: 'ID môn thể thao' })
	@Expose({ name: '_id' })
	@Transform(({ obj }: { obj: { _id?: Types.ObjectId | string } }) => obj._id?.toString())
	_id: string;

	@ApiProperty()
	@Expose()
	name: string;

	@ApiProperty({ required: false })
	@Expose()
	description?: string;

	@ApiProperty({ required: false })
	@Expose()
	iconUrl?: string;
}
