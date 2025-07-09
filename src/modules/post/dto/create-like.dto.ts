import { TargetType } from '@common/enum/target-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsEnum } from 'class-validator';

export class CreateLikeDto {
	@ApiProperty({ description: 'ID của bài viết hoặc bình luận' })
	@IsMongoId()
	targetId: string;

	@ApiProperty({ enum: TargetType, description: 'Loại nội dung được like' })
	@IsEnum(TargetType)
	targetType: TargetType;
}
