import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNumberString, IsOptional } from 'class-validator';
import { TargetType } from '@common/enum/target-type.enum';

export class GetLikesQueryDto {
	@ApiPropertyOptional({ description: 'ID bài viết hoặc bình luận', example: '60d...' })
	@IsMongoId()
	targetId: string;

	@ApiPropertyOptional({ description: 'Loại đối tượng: Post hoặc Comment', enum: TargetType })
	@IsEnum(TargetType)
	targetType: TargetType;

	@ApiPropertyOptional({ example: '1', description: 'Trang hiện tại' })
	@IsOptional()
	@IsNumberString()
	page?: string;

	@ApiPropertyOptional({ example: '10', description: 'Số lượt like mỗi trang' })
	@IsOptional()
	@IsNumberString()
	limit?: string;
}
