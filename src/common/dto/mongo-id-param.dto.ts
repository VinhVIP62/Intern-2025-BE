import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MongoIdParamDto {
	@ApiProperty({ example: '60f8b5e8b3e2f828d8f6e3b5' })
	@IsMongoId({ message: 'ID không hợp lệ' })
	id: string;
}
